<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePreferredReducedMotion } from '@vueuse/core'
import { useDocsStore } from '@/store/modules/docs'
import type { KnowledgeDoc } from '@/types/content'

// 知识星球（真实地球版）：NASA 蓝球贴图 + 地形法线 + 海洋高光 + 独立云层 + 大气辉光
// 文档星贴在球面闪烁，悬停预览、点击直达文章
// 贴图：public/textures/earth/（NASA 公有领域素材，来源见该目录 SOURCES.md）
// 降级：贴图加载失败退化为纯色星球；窄屏纯渐变；reduced-motion 动画降速 0.3 倍不静止

const docsStore = useDocsStore()
const router = useRouter()
const preferredReducedMotion = usePreferredReducedMotion()

const containerRef = ref<HTMLElement | null>(null)
const tooltipDoc = ref<KnowledgeDoc | null>(null)
const tooltipPos = ref({ x: 0, y: 0 })
const isNarrow = ref(false)
const sceneReady = ref(false)

type GalaxyNamespace = typeof import('three')

let THREE: GalaxyNamespace | null = null
let renderer: import('three').WebGLRenderer | null = null
let scene: import('three').Scene | null = null
let camera: import('three').PerspectiveCamera | null = null
let planetGroup: import('three').Group | null = null
let raycaster: import('three').Raycaster | null = null
let frameId = 0
let resizeObserver: ResizeObserver | null = null
let started = false
let disposed = false

// 地球贴图：在 start() 里预加载完成后再建场景，避免出现无贴图的空白球。
// 只有 day 是必需的，其余缺失时逐项降级。
interface EarthTextures {
  day: import('three').Texture
  normal: import('three').Texture | null
  specular: import('three').Texture | null
  clouds: import('three').Texture | null
}

let earthTextures: EarthTextures | null = null
let cloudMesh: import('three').Mesh | null = null

// 文档星 sprite（含拾取）
const starSprites: import('three').Sprite[] = []
let hoveredStar: import('three').Sprite | null = null

// 小气泡标签：每个文档星在球面正面的投影位置（转到背面自动隐藏）
const labelEls = new Map<string, HTMLElement>()
const starLabels = computed(() =>
  docs.value.map((doc) => ({ id: doc.id, text: doc.tags[0] ?? '文档' })),
)

function setLabelRef(el: unknown, id: string) {
  if (el) {
    labelEls.set(id, el as HTMLElement)
  } else {
    labelEls.delete(id)
  }
}

// 流星：池化复用，随机间隔从画面上方斜划而过
interface Meteor {
  group: import('three').Group
  line: import('three').Line
  head: import('three').Sprite
  velocity: import('three').Vector3
  life: number
  maxLife: number
  active: boolean
}

const meteorGroups: import('three').Group[] = []
const meteors: Meteor[] = []
let nextMeteorAt = 2.5

const STAR_COLOR = '#22d3ee'

const pointerNdc = { x: 0, y: 0 }
const pointerActive = ref(false)

const docs = computed(() => docsStore.docs)

function isMobileWidth() {
  return typeof window !== 'undefined' && window.innerWidth < 640
}

function createGlowTexture(color: string) {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, color)
  gradient.addColorStop(0.3, `${color}77`)
  gradient.addColorStop(1, 'transparent')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE!.CanvasTexture(canvas)
  texture.colorSpace = THREE!.SRGBColorSpace
  return texture
}

function buildPlanet() {
  if (!THREE || !planetGroup) {
    return
  }

  // 清掉旧文档星（保留行星本体与大气）
  for (const star of starSprites) {
    planetGroup.remove(star)
    star.material.dispose()
  }
  starSprites.length = 0
  hoveredStar = null
  tooltipDoc.value = null

  const glow = new THREE.SpriteMaterial({
    map: createGlowTexture(STAR_COLOR),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  // 斐波那契球面：文档星均匀贴在球面上（略高于地表与云层，保证可见且随球体一起自转）
  const count = docs.value.length
  const golden = Math.PI * (1 + Math.sqrt(5))
  const orbitRadius = 7.12

  docs.value.forEach((doc, index) => {
    const y = 1 - (2 * (index + 0.5)) / count
    const flat = Math.sqrt(1 - y * y)
    const theta = golden * index

    const star = new THREE!.Sprite(glow)
    star.position.set(
      orbitRadius * flat * Math.cos(theta),
      orbitRadius * y,
      orbitRadius * flat * Math.sin(theta),
    )
    star.userData.doc = doc
    star.userData.phase = Math.random() * Math.PI * 2
    star.userData.baseScale = 1.5 + Math.random() * 0.7
    star.scale.setScalar(star.userData.baseScale)
    planetGroup!.add(star)
    starSprites.push(star)
  })
}

function buildScene() {
  if (!THREE || !scene) {
    return
  }

  planetGroup = new THREE.Group()
  scene.add(planetGroup)

  // 地球本体：颜色贴图 + 地形法线 + 海洋高光遮罩（白＝海洋反光，黑＝陆地哑光）。
  // 用 MeshPhongMaterial 而非 Standard：specularMap 的语义直接就是"哪里反光"，
  // 不需要把高光遮罩反相成粗糙度贴图。
  const planetMaterial = new THREE!.MeshPhongMaterial({
    map: earthTextures?.day ?? null,
    normalMap: earthTextures?.normal ?? null,
    normalScale: new THREE!.Vector2(0.85, 0.85),
    specularMap: earthTextures?.specular ?? null,
    // 高光要"宽而弱"：太阳接近镜头时，锐利高光会在球心糊成一大团白光盖掉海底地形。
    // 参考图用的是 roughness 0.9 级别的粗糙材质，几乎只有一层柔和光泽。
    specular: new THREE!.Color(0x2e4457),
    shininess: 6,
    // 贴图缺失时退化为深蓝星球，不会出现刺眼的白球
    color: earthTextures?.day ? 0xffffff : 0x123a63,
  })

  const planet = new THREE.Mesh(new THREE.SphereGeometry(7, 96, 96), planetMaterial)
  planetGroup.add(planet)

  // 云层：略大于地表，自身再慢速自转（比地表稍快）形成云系漂移
  if (earthTextures?.clouds) {
    cloudMesh = new THREE!.Mesh(
      new THREE!.SphereGeometry(7.06, 64, 64),
      new THREE!.MeshPhongMaterial({
        map: earthTextures.clouds,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
      }),
    )
    planetGroup.add(cloudMesh)
  }

  // 大气辉光：菲涅尔边缘发光（背面渲染）
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(7.95, 64, 64),
    new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.58 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.3, 0.72, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    }),
  )
  planetGroup.add(atmosphere)

  // 文档星
  buildPlanet()

  // 流星池：3 组（亮头 + 渐隐尾线），默认隐藏
  for (let index = 0; index < 3; index += 1) {
    const group = new THREE.Group()
    group.visible = false

    const tailGeometry = new THREE.BufferGeometry()
    tailGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3))
    const line = new THREE.Line(
      tailGeometry,
      new THREE.LineBasicMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    group.add(line)

    const head = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createGlowTexture('#e0f2fe'),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0,
      }),
    )
    head.scale.setScalar(1.1)
    group.add(head)

    scene.add(group)
    meteorGroups.push(group)
    meteors.push({ group, line, head, velocity: new THREE.Vector3(), life: 0, maxLife: 0, active: false })
  }

  // 灯光：白色侧光当太阳（制造昼夜明暗交界）+ 中性环境光（夜面不致死黑，仍能看清大陆轮廓）
  // 环境光偏高：深海贴图本身很暗，需要足够的环境光才能把海底地形"托"出来
  scene.add(new THREE.AmbientLight(0x7fa3c8, 2.4))
  const sunLight = new THREE.DirectionalLight(0xffffff, 3.0)
  // 太阳偏右前方：右半明亮、左缘留一条明暗交界，兼顾立体感与可读性
  sunLight.position.set(16, 6, 17)
  scene.add(sunLight)

  // 背景星野
  const count = 700
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let index = 0; index < count; index += 1) {
    const radius = 34 + Math.random() * 30
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[index * 3 + 1] = radius * Math.cos(phi)
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)

    const tint = new THREE.Color(Math.random() > 0.7 ? '#a5b4fc' : '#e2e8f0')
    colors[index * 3] = tint.r
    colors[index * 3 + 1] = tint.g
    colors[index * 3 + 2] = tint.b
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  scene.add(
    new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        size: 0.18,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    ),
  )
}

function initScene() {
  const container = containerRef.value

  if (!container || !THREE || started) {
    return
  }

  started = true

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 200)
  camera.position.set(0, 1.5, 24)
  camera.lookAt(0, 0, 0)

  raycaster = new THREE.Raycaster()

  buildScene()
  sceneReady.value = true

  container.addEventListener('pointermove', handlePointerMove)
  container.addEventListener('pointerleave', handlePointerLeave)
  container.addEventListener('click', handleClick)

  resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(container)

  animate()
}

function updatePointer(event: PointerEvent) {
  const container = containerRef.value

  if (!container) {
    return
  }

  const rect = container.getBoundingClientRect()
  pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  pointerActive.value = true
}

function handlePointerMove(event: PointerEvent) {
  updatePointer(event)
}

function handlePointerLeave() {
  pointerActive.value = false
  hoveredStar = null
  tooltipDoc.value = null
}

function handleClick() {
  const doc = hoveredStar ? (hoveredStar.userData.doc as KnowledgeDoc) : null

  if (doc) {
    void router.push(`/knowledge/${doc.id}`)
  }
}

function handleResize() {
  const container = containerRef.value

  if (!container || !renderer || !camera) {
    return
  }

  camera.aspect = container.clientWidth / container.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.clientWidth, container.clientHeight)
}

onMounted(() => {
  isNarrow.value = isMobileWidth()

  if (docs.value.length) {
    void start()
  }
})

// 预加载地球贴图：只有 day 是必需的，其余缺失时逐项降级；全部失败也能正常出场景
function loadEarthTextures(): Promise<EarthTextures | null> {
  const T = THREE

  if (!T) {
    return Promise.resolve(null)
  }

  const loader = new T.TextureLoader()

  const load = (file: string, srgb = false) =>
    new Promise<import('three').Texture | null>((resolve) => {
      loader.load(
        `/textures/earth/${file}`,
        (texture) => {
          if (srgb) {
            texture.colorSpace = T.SRGBColorSpace
          }
          // 球面贴图在斜视角下容易糊，各向异性过滤能明显改善
          texture.anisotropy = 4
          resolve(texture)
        },
        undefined,
        () => resolve(null),
      )
    })

  return Promise.all([
    load('earth_day.jpg', true),
    load('earth_normal.jpg'),
    load('earth_specular.jpg'),
    load('earth_clouds.png', true),
  ]).then(([day, normal, specular, clouds]) =>
    day ? { day, normal, specular, clouds } : null,
  )
}

function disposeEarthTextures() {
  if (!earthTextures) {
    return
  }

  for (const texture of Object.values(earthTextures)) {
    texture?.dispose()
  }

  earthTextures = null
}

async function start() {
  if (isNarrow.value || started) {
    return
  }

  THREE = (await import('three')) as GalaxyNamespace
  earthTextures = await loadEarthTextures()

  // 贴图加载期间组件可能已卸载：此时不要再建 WebGL 场景，直接回收
  if (disposed) {
    disposeEarthTextures()
    return
  }

  initScene()
}

watch(docs, (value) => {
  if (value.length && started && THREE) {
    buildPlanet()
  }

  if (value.length && !started) {
    void start()
  }
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(frameId)
  resizeObserver?.disconnect()
  resizeObserver = null
  const container = containerRef.value
  container?.removeEventListener('pointermove', handlePointerMove)
  container?.removeEventListener('pointerleave', handlePointerLeave)
  container?.removeEventListener('click', handleClick)

  scene?.traverse((object) => {
    const mesh = object as import('three').Mesh

    if (mesh.geometry) {
      mesh.geometry.dispose()
    }

    const material = mesh.material as import('three').Material | import('three').Material[] | undefined

    if (Array.isArray(material)) {
      material.forEach((entry) => entry.dispose())
    } else {
      material?.dispose()
    }
  })

  renderer?.dispose()
  disposeEarthTextures()
  renderer = null
  scene = null
  planetGroup = null
  cloudMesh = null
  started = false
})

function spawnMeteor() {
  const meteor = meteors.find((entry) => !entry.active)

  if (!meteor || !THREE) {
    return
  }

  meteor.active = true
  meteor.life = 0
  meteor.maxLife = 1.6 + Math.random() * 0.8

  meteor.velocity.set(
    (Math.random() - 0.5) * 1.4,
    -1,
    0,
  ).normalize().multiplyScalar(17 + Math.random() * 9)

  meteor.group.position.set(
    -14 + Math.random() * 26,
    9 + Math.random() * 7,
    -6 + Math.random() * 6,
  )
  meteor.group.visible = true
}

function updateMeteors(deltaTime: number, localTime: number) {
  if (preferredReducedMotion.value === 'reduce') {
    return
  }

  if (localTime > nextMeteorAt) {
    spawnMeteor()
    nextMeteorAt = localTime + 6 + Math.random() * 9
  }

  for (const meteor of meteors) {
    if (!meteor.active) {
      continue
    }

    meteor.life += deltaTime
    const progress = meteor.life / meteor.maxLife

    if (progress >= 1) {
      meteor.active = false
      meteor.group.visible = false
      continue
    }

    meteor.group.position.addScaledVector(meteor.velocity, deltaTime)

    // 头亮尾淡：透明度走正弦包络
    const envelope = Math.sin(progress * Math.PI)
    const tail = meteor.line.geometry.getAttribute('position') as import('three').BufferAttribute
    const tailPos = meteor.group.position.clone().addScaledVector(meteor.velocity, -0.16)
    tail.setXYZ(0, meteor.group.position.x, meteor.group.position.y, meteor.group.position.z)
    tail.setXYZ(1, tailPos.x, tailPos.y, tailPos.z)
    tail.needsUpdate = true

    ;(meteor.line.material as import('three').LineBasicMaterial).opacity = 0.7 * envelope
    ;(meteor.head.material as import('three').SpriteMaterial).opacity = envelope
  }
}

// 文档星小标签：投影星点位置，仅球面朝向相机的星显示（转到背面自动隐藏）
function updateStarLabels() {
  const container = containerRef.value

  if (!container || !planetGroup || !camera) {
    return
  }

  const width = container.clientWidth
  const height = container.clientHeight
  const camDir = camera.position.clone().normalize()

  for (const [index, star] of starSprites.entries()) {
    const label = starLabels.value[index]
    const el = label ? labelEls.get(label.id) : null

    if (!el) {
      continue
    }

    const world = star.position.clone().applyMatrix4(planetGroup.matrixWorld)
    const facing = world.clone().normalize().dot(camDir)

    if (facing < 0.32) {
      el.style.opacity = '0'
      continue
    }

    const projected = world.clone().project(camera)
    el.style.left = (projected.x * 0.5 + 0.5) * width + 'px'
    el.style.top = (-projected.y * 0.5 + 0.5) * height + 'px'
    el.style.opacity = String(Math.min(1, Math.max(0, (facing - 0.32) * 4)))
  }
}

function animate() {
  frameId = requestAnimationFrame(animate)

  if (!planetGroup || !renderer || !scene || !camera || !raycaster) {
    return
  }

  const time = performance.now() * 0.001
  // 系统开启"减弱动态效果"时动画降速 0.3 倍而非静止（星球是页面核心视觉）
  const speed = preferredReducedMotion.value === 'reduce' ? 0.3 : 1
  const localTime = time * speed

  // 地球自转 + 整体悬浮呼吸 + 云层相对地表缓慢漂移
  planetGroup.rotation.y += 0.0022 * speed
  planetGroup.position.y = Math.sin(localTime * 0.6) * 0.7

  if (cloudMesh) {
    cloudMesh.rotation.y += 0.0006 * speed
  }

  // 文档星闪烁（各自相位）+ 悬停放大
  for (const star of starSprites) {
    const meta = star.userData as { phase: number; baseScale: number }
    const twinkle = 0.82 + 0.3 * Math.abs(Math.sin(localTime * 2.1 + meta.phase))
    const target = star === hoveredStar ? meta.baseScale * 2.1 : meta.baseScale * twinkle
    const current = star.scale.x
    star.scale.setScalar(current + (target - current) * 0.14)
  }

  // 流星（reduced-motion 下不生成）+ 文档星小标签投影
  const lastFrame = Number((globalThis as Record<string, unknown>).__galaxyLastFrame ?? localTime)
  ;(globalThis as Record<string, unknown>).__galaxyLastFrame = localTime
  updateMeteors(Math.min(0.05, Math.max(0, localTime - lastFrame)), localTime)
  updateStarLabels()

  // 悬停拾取
  if (pointerActive) {
    raycaster.setFromCamera(pointerNdc as unknown as import('three').Vector2, camera)
    const hits = raycaster.intersectObjects(starSprites, false)
    const first = (hits[0]?.object as import('three').Sprite | undefined) ?? null

    if (first !== hoveredStar) {
      hoveredStar = first
      const doc = first ? (first.userData.doc as KnowledgeDoc) : null
      tooltipDoc.value = doc

      if (doc && first) {
        const world = first.position.clone().applyMatrix4(planetGroup.matrixWorld)
        world.project(camera)
        tooltipPos.value = {
          x: (world.x * 0.5 + 0.5) * (containerRef.value?.clientWidth ?? 0),
          y: (-world.y * 0.5 + 0.5) * (containerRef.value?.clientHeight ?? 0),
        }
      }
    }
  }

  renderer.render(scene, camera)
}
</script>

<template>
  <div class="knowledge-galaxy" :class="{ 'is-narrow': isNarrow }">
    <div ref="containerRef" class="knowledge-galaxy-canvas" aria-label="知识星球：点击星球上的星星直达对应文章" />

    <div class="knowledge-galaxy-labels" aria-hidden="true">
      <span
        v-for="label in starLabels"
        :key="label.id"
        :ref="(el) => setLabelRef(el, label.id)"
        class="knowledge-galaxy-label"
      >
        {{ label.text }}
      </span>
    </div>

    <div
      v-if="tooltipDoc"
      class="knowledge-galaxy-tooltip"
      :style="{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }"
    >
      <p class="knowledge-galaxy-tooltip-title">{{ tooltipDoc.title }}</p>
      <p class="knowledge-galaxy-tooltip-tags">{{ tooltipDoc.tags.slice(0, 3).join(' · ') }}</p>
    </div>

    <p v-if="!isNarrow && sceneReady" class="knowledge-galaxy-hint">星球上的每颗星是一篇文章 · 悬停预览 · 点击直达</p>
  </div>
</template>
