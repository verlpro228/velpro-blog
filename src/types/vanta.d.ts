declare module 'vanta/dist/vanta.halo.min.js' {
  interface VantaEffect {
    destroy: () => void
    resize?: () => void
  }

  type VantaHaloFactory = (options: Record<string, unknown>) => VantaEffect

  const VantaHalo: VantaHaloFactory

  export default VantaHalo
}
