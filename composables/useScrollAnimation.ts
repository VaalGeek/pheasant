import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

export default function useScrollTriggerAnimation(
  triggerSelector: string,
  animationSetup: () => gsap.core.Timeline
) {
  onMounted(() => {
    gsap.registerPlugin(ScrollTrigger)

    ScrollTrigger.create({
      trigger: triggerSelector,
      start: 'top 75%',
      end: 'bottom 25%',
      markers: false,
      onEnter: () => {
        const tl = animationSetup()
        tl.play()
      },
      onEnterBack: () => {
        const tl = animationSetup()
        tl.play()
      },
      onLeave: () => {
        gsap.set(triggerSelector, { clearProps: 'all' })
      }
    })
  })

  onUnmounted(() => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill())
  })
}