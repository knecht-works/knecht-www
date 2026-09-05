<script setup lang="ts">
// Community card. The messages are illustrative examples from the design, not a
// live feed. Names and colors stay here, the texts live in the locale files.
const { t } = useI18n()

const messageMeta = [
  { key: 'a', accent: 'text-accent-mint' },
  { key: 'b', accent: 'text-accent-violet' },
  { key: 'c', accent: 'text-accent-orange' }
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
        class="discord-card relative col-span-full overflow-hidden rounded-2xl border border-default"
      >
        <div
          aria-hidden="true"
          class="discord-glow"
        />

        <div class="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-14 lg:py-12">
          <div>
            <h2 class="text-balance text-highlighted">
              {{ $t('discord.title') }}
            </h2>

            <p class="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
              {{ $t('discord.text') }}
            </p>

            <UButton
              :label="$t('discord.cta')"
              icon="i-simple-icons-discord"
              size="lg"
              :to="DISCORD_URL"
              target="_blank"
              class="mt-7 bg-accent-discord text-white hover:bg-accent-discord/85"
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
                class="mt-0.5 size-7.5 shrink-0 rounded-full bg-current"
                :class="message.accent"
              />
              <div class="min-w-0">
                <div class="flex flex-wrap items-baseline gap-2">
                  <span
                    class="text-sm font-semibold"
                    :class="message.accent"
                  >{{ message.name }}</span>
                  <span class="font-mono text-2xs text-dimmed">{{ message.time }}</span>
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
