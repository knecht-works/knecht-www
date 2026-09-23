<script setup lang="ts">
// Screen-recording scene: "Try it out now!" fades in, the mascot looks down at it,
// comes back up and shakes its head. Click to replay.
definePageMeta({ layout: false })

useSeoMeta({ robots: 'noindex, nofollow', title: 'Knecht Promo' })

const run = ref(0)
const replay = () => {
  run.value++
}
</script>

<template>
  <div
    class="promo fixed inset-0 cursor-pointer select-none overflow-hidden bg-default"
    @click="replay"
  >
    <div
      class="bg-field"
      aria-hidden="true"
    >
      <div class="bg-grid" />
      <div class="glow glow-a" />
      <div class="glow glow-b" />
    </div>

    <div
      :key="run"
      class="promo-stage"
    >
      <div class="promo-mascot">
        <div class="promo-mascot-flip">
          <img
            :src="'/assets/mascotLeft-body.svg'"
            alt=""
            width="654"
            height="1199"
            class="drop-shadow-mascot absolute inset-0 h-full w-full object-contain"
          >
          <img
            :src="'/assets/mascotLeft-head.svg'"
            alt=""
            width="654"
            height="1199"
            class="promo-head absolute inset-0 h-full w-full object-contain will-change-transform"
          >
        </div>
      </div>

      <div class="promo-copy">
        <div class="promo-wordmark text-highlighted">
          Knecht
        </div>
        <div class="promo-cta">
          <span class="promo-button bg-inverted text-inverted">
            Try it out now!
            <UIcon
              name="i-lucide-arrow-right"
              class="promo-arrow"
            />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.promo-stage {
  position: relative;
  z-index: 10;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  gap: 6vw;
  padding-inline: 4vw;
}

.promo-mascot {
  position: relative;
  aspect-ratio: 654 / 1199;
  height: 60vh;
  flex: none;
}

.promo-mascot-flip {
  position: absolute;
  inset: 0;
  transform: scaleX(-1);
}

.promo-head {
  transform-origin: 49.4% 32.2%;
  animation: promo-head 5.5s linear both;
}

.promo-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3.5vh;
}

.promo-wordmark {
  font-size: 17vh;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.05em;
}

.promo-cta {
  transform-origin: 30% 50%;
  animation: promo-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: 1.4s;
}

.promo-button {
  display: inline-flex;
  align-items: center;
  gap: 1.4vh;
  border-radius: 1.4vh;
  padding: 1.8vh 3vh;
  font-size: 3vh;
  font-weight: 500;
  line-height: 1;
  box-shadow: 0 1px 2px 0 oklch(0 0 0 / 0.3);
}

.promo-arrow {
  width: 2.6vh;
  height: 2.6vh;
}

@keyframes promo-pop {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Coming up overshoots into a damped wobble: constant period, amplitude
   roughly halving each swing, so the heavy CRT head settles instead of
   snapping into place. */
@keyframes promo-head {
  0%,
  25.5% {
    rotate: 0deg;
    animation-timing-function: cubic-bezier(0.34, 1.4, 0.64, 1);
  }
  32.7% {
    rotate: -22deg;
  }
  56.4% {
    rotate: -22deg;
    animation-timing-function: ease-in;
  }
  60.9% {
    rotate: 10deg;
    animation-timing-function: ease-in-out;
  }
  64.2% {
    rotate: -8deg;
    animation-timing-function: ease-in-out;
  }
  67.5% {
    rotate: 6deg;
    animation-timing-function: ease-in-out;
  }
  70.7% {
    rotate: -4deg;
    animation-timing-function: ease-in-out;
  }
  74% {
    rotate: 2.5deg;
    animation-timing-function: ease-in-out;
  }
  77.3% {
    rotate: -1.5deg;
    animation-timing-function: ease-in-out;
  }
  80.5% {
    rotate: 0.8deg;
    animation-timing-function: ease-in-out;
  }
  83.6%,
  100% {
    rotate: 0deg;
  }
}
</style>
