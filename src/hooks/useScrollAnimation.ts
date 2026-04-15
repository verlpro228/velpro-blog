import type { Ref } from 'vue'
import gsap from 'gsap'
import { useGsap } from './useGsap'

export function useScrollAnimation() {
  const { gsap, ScrollTrigger } = useGsap()

  const fadeInUp = (targets: Element | Element[] | string, trigger?: Element | string) => {
    return gsap.fromTo(
      targets,
      { y: 36, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: trigger ?? targets,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      },
    )
  }

  const staggerReveal = (
    targets: Element[] | string,
    trigger?: Element | string,
    vars?: Partial<gsap.TweenVars>,
  ) => {
    return gsap.from(targets, {
      y: 42,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: trigger ?? targets,
        start: 'top 78%',
        toggleActions: 'play none none reverse',
      },
      ...vars,
    })
  }

  const createParallax = (target: Element | string, trigger?: Element | string, distance = 72) => {
    return gsap.fromTo(
      target,
      { y: -distance / 2 },
      {
        y: distance,
        ease: 'none',
        scrollTrigger: {
          trigger: trigger ?? target,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    )
  }

  const progressScale = (target: Ref<HTMLElement | null>) => {
    if (!target.value) {
      return null
    }

    return gsap.to(target.value, {
      scaleX: 1,
      ease: 'none',
      transformOrigin: 'left center',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    })
  }

  return {
    fadeInUp,
    staggerReveal,
    createParallax,
    progressScale,
    ScrollTrigger,
  }
}
