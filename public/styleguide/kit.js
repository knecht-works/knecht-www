/*
 * Knecht Styleguide - shared JS helpers for test fixtures.
 * Served globally from knecht.works. Include in a fixture with:
 *   <script src="https://knecht.works/styleguide/kit.js" defer></script>
 * Everything is exposed on the global `KnechtKit` namespace.
 */
(function (window, document) {
  'use strict'

  var KnechtKit = {
    /** Run a callback once the DOM is ready. */
    ready: function (fn) {
      if (document.readyState !== 'loading') {
        fn()
      } else {
        document.addEventListener('DOMContentLoaded', fn)
      }
    },

    /** Show a short-lived toast message. */
    toast: function (message, duration) {
      var el = document.createElement('div')
      el.className = 'kit-toast'
      el.textContent = message
      document.body.appendChild(el)
      // Force a reflow so the transition runs.
      void el.offsetWidth
      el.classList.add('is-visible')
      window.setTimeout(function () {
        el.classList.remove('is-visible')
        el.addEventListener('transitionend', function () {
          el.remove()
        })
      }, duration || 2500)
    },

    /** Copy text to the clipboard, falling back gracefully. */
    copy: function (text) {
      if (window.navigator.clipboard) {
        return window.navigator.clipboard.writeText(text)
      }
      var area = document.createElement('textarea')
      area.value = text
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
      return Promise.resolve()
    },
  }

  // Auto-wiring: any element with data-kit-toast shows its value on click.
  KnechtKit.ready(function () {
    document.querySelectorAll('[data-kit-toast]').forEach(function (node) {
      node.addEventListener('click', function () {
        KnechtKit.toast(node.getAttribute('data-kit-toast'))
      })
    })
  })

  window.KnechtKit = KnechtKit
})(window, document)
