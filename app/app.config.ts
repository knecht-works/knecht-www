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
      },
      table: {
        slots: {
          root: 'slider-scrollbar relative -mx-(--container-margin-x) my-3 overflow-x-auto px-(--container-margin-x) py-5 border-0',
          base: 'w-full border-separate border-spacing-0 rounded-md text-left'
        }
      },
      thead: {
        base: 'bg-transparent'
      },
      tbody: {
        base: ''
      },
      tr: {
        base: '[&>td]:transition-colors [&:nth-child(even)>td]:bg-elevated/40 [&:first-child>th:first-child]:rounded-tl-md [&:first-child>th:last-child]:rounded-tr-md [&:last-child>td:first-child]:rounded-bl-md [&:last-child>td:last-child]:rounded-br-md border-0!'
      },
      th: {
        base: 'bg-elevated px-5 py-3.5 text-sm leading-relaxed text-elevated'
      },
      td: {
        base: 'border-default first:border-e px-5 py-3.5 text-sm leading-relaxed text-muted first:font-medium first:text-highlighted'
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
