<script setup lang="ts">
// Community card. The messages are illustrative examples from the design, not a
// live feed. Names and colors stay here, the texts live in the locale files.
const { t } = useI18n()

const messageMeta = [
  { key: 'a', accent: 'var(--accent-mint)' },
  { key: 'b', accent: 'var(--accent-violet)' },
  { key: 'c', accent: 'var(--accent-orange)' }
]

const messages = computed(() => messageMeta.map(item => ({
  ...item,
  name: t(`discord.messages.${item.key}.name`),
  time: t(`discord.messages.${item.key}.time`),
  text: t(`discord.messages.${item.key}.text`)
})))
</script>

<template>
  <section id="discord">
    <div class="container pt-default">
      <AppReveal
        :y="22"
        :duration="0.7"
        class="relative col-span-full overflow-hidden rounded-2xl border border-default bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent-discord)_14%,transparent),oklch(1_0_0/0.015))]"
      >
        <div
          aria-hidden="true"
          class="pointer-events-none absolute -right-40 -top-52 size-[520px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent-discord)_35%,transparent),transparent_70%)]"
        />

        <div class="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-14 lg:py-12">
          <div>
            <AppEyebrow
              :label="$t('discord.eyebrow')"
              dot-color="discord"
            />

            <h2 class="mt-5 text-balance text-highlighted">
              {{ $t('discord.title') }}
            </h2>

            <p class="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-[17px]">
              {{ $t('discord.text') }}
            </p>

            <UButton
              :label="$t('discord.cta')"
              icon="i-simple-icons-discord"
              size="lg"
              :to="DISCORD_URL"
              target="_blank"
              class="mt-7 bg-[var(--accent-discord)] text-white hover:bg-[var(--accent-discord)]/85"
            />
          </div>

          <ol class="flex flex-col gap-2.5">
            <AppReveal
              v-for="(message, i) in messages"
              :key="message.key"
              as="li"
              :delay="0.1 + i * 0.1"
              class="flex items-start gap-3 rounded-xl border border-default bg-default/70 px-3.5 py-3"
            >
              <span
                aria-hidden="true"
                class="mt-0.5 size-[30px] shrink-0 rounded-full"
                :style="{ background: message.accent }"
              />
              <div class="min-w-0">
                <div class="flex flex-wrap items-baseline gap-2">
                  <span
                    class="text-[13px] font-semibold"
                    :style="{ color: message.accent }"
                  >{{ message.name }}</span>
                  <span class="font-mono text-[11px] text-dimmed">{{ message.time }}</span>
                </div>
                <p class="mt-0.5 text-sm leading-normal text-toned">
                  {{ message.text }}
                </p>
              </div>
            </AppReveal>
          </ol>
        </div>
      </AppReveal>
    </div>
  </section>
</template>
