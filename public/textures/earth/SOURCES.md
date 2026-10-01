# 地球贴图来源

首页「知识星球」使用的地球贴图，原始影像均来自 **NASA 公有领域素材**（NASA 内容不受版权保护，
可自由使用与再分发）。此处仅做了重命名与格式整理。

| 文件 | 用途 | 原始来源 |
| --- | --- | --- |
| `earth_day.jpg` | 地表颜色（含海洋海底地形明暗） | NASA Blue Marble 地形／水深图 `world.topo.bathy.200401.jpg`，取自 Apache ECharts GL 示例素材 |
| `earth_normal.jpg` | 地形法线（山脉与海沟起伏） | three.js 示例素材 `examples/textures/planets/earth_normal_2048.jpg` |
| `earth_specular.jpg` | 高光遮罩（白＝海洋反光，黑＝陆地哑光） | three.js 示例素材 `examples/textures/planets/earth_specular_2048.jpg` |
| `earth_clouds.png` | 云层（调色板 PNG，带透明通道，可独立于地表漂移） | three.js 示例素材 `examples/textures/planets/earth_clouds_1024.png` |

参考链接：

- NASA 影像与媒体使用政策：https://www.nasa.gov/nasa-brand-center/images-and-media/
- three.js 示例贴图目录：https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets
- ECharts GL 示例素材：https://echarts.apache.org/examples/data-gl/asset/

> 若日后需要替换为更高分辨率或自制贴图，只要保持**等距圆柱投影（equirectangular）**并沿用上述文件名即可，
> 组件无需改动。
