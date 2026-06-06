export default defineAppConfig({
  ui: {
    colors: {
      primary: 'lime',
      neutral: 'zinc'
    },
    button: {
      slots: {
        base: 'rounded-lg'
      },
      variants: {
        size: {
          lg: {
            base: 'px-5 py-3 text-sm'
          }
        }
      },
      compoundVariants: [
        {
          variant: 'solid',
          class: 'shadow-sm transition-shadow hover:shadow-md'
        }
      ]
    }
  }
})
