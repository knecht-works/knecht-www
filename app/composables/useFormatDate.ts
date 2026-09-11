export const useFormatDate = () => {
  const { locale } = useI18n()
  const tag = computed(() => locale.value === 'de' ? 'de-DE' : 'en-US')

  return (date: string) =>
    new Intl.DateTimeFormat(tag.value, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
}
