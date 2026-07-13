export default defineAppConfig({
  ui: {
    colors: {
      primary: 'lime',
      neutral: 'zinc'
    },
    prose: {
      img: {
        slots: {
          base: 'rounded-lg border border-default shadow-panel',
          zoomedImage: 'rounded-lg border border-default w-auto! h-full!'
        }
      }
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
