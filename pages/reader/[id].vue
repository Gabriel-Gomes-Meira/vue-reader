<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import Epub from 'epubjs'
const { $hammer } = useNuxtApp()

const store = useStore()
const route = useRoute()
const rendition = ref({})

const isTouchDevice = ref(false)
const isChangingPage = ref(false)
const displaying = ref(false)

const commands = ref({})
const keyboardFunctions = ref(null)
const hammerManager = ref(null)

const lastTouchTime = ref(0)
const MIN_TOUCH_INTERVAL = 250 // tempo mínimo entre toques em ms

const getBookMarks = computed(() => store.getters.getBookMarks.filter(bookMark => bookMark.bookId === route.params.id))
const labelTocByLocations = computed(() => {
  if (!displaying.value) return {}

  const labels = {}
  let toc_index = -1

  for (let location_index = 0; location_index < rendition.value.book.spine.items.length; location_index++) {
    const key = rendition.value.book.spine.items[location_index].href
    if (rendition.value.book.spine.items[location_index].href === rendition.value.book.navigation.toc[toc_index + 1]?.href) {
      toc_index++
    }
    labels[key] = rendition.value.book.navigation.toc[toc_index].label
  }
  return labels
})

const addBookMark = () => {
  store.commit('ADD_BOOKMARK', {bookId: route.params.id, location: rendition.value.currentLocation()})
  store.dispatch('storeBookMark')
}

const clearBookMarks = () => {
  store.commit('CLEAR_BOOKMARKS', route.params.id)
  store.dispatch('storeBookMark')
}

const displayPointAt = (bookMark) => {
  rendition.value.display(bookMark.start.cfi)
}

const removeBookMark = (index) => {
  store.commit('REMOVE_BOOKMARK', index)
  store.dispatch('storeBookMark')
}

const setupKeyboardControls = () => {
  commands.value = {
    "ArrowRight": () => rendition.value.next(),
    "ArrowLeft": () => rendition.value.prev()
  }

  keyboardFunctions.value = (e) => {
    commands.value[e.key]?.()
  }

  window.document.addEventListener("keydown", keyboardFunctions.value)
}

const setupTheme = () => {
  rendition.value.themes.default({
    html: {
      'background-color': 'rgb(15, 23, 42)',
      color: "#b4c6ef",
      'line-height': 1.5,
      '-webkit-text-size-adjust': '100%',
      '-moz-tab-size': '4',
      '-o-tab-size': '4',
      'tab-size': '4',
      'font-family': 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
      'font-feature-settings': 'normal',
    },
    a: {
      color: "#b4c6ef"
    }
  }, "/output.css")
}

const checkTouchDevice = () => {
  // Verifica se o dispositivo suporta touch através de múltiplas propriedades
  isTouchDevice.value = (
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0) // Para suporte a IE
  )
}

const setupTouchEvents = () => {
  const iframe = document.querySelector('#area iframe')
  if (!iframe?.contentDocument) return

  // Limpa instância anterior
  if (hammerManager.value) {
    hammerManager.value.destroy()
  }

  try {
    hammerManager.value = new $hammer(iframe.contentDocument.body)

    hammerManager.value.get('swipe').set({
      direction: $hammer.DIRECTION_HORIZONTAL,
      threshold: 50,
      velocity: 0.3
    })

    hammerManager.value.get('pan').set({
      direction: $hammer.DIRECTION_HORIZONTAL
    })

    hammerManager.value.on('swipe', async (e) => {
      if (isChangingPage.value) return

      const now = Date.now()
      if (now - lastTouchTime.value < MIN_TOUCH_INTERVAL) return

      isChangingPage.value = true
      lastTouchTime.value = now

      try {
        if (e.direction === $hammer.DIRECTION_LEFT) {
          await rendition.value.next()
        } else if (e.direction === $hammer.DIRECTION_RIGHT) {
          await rendition.value.prev()
        }
      } catch (error) {
        console.error('Erro ao mudar página:', error)
      } finally {
        setTimeout(() => {
          isChangingPage.value = false
        }, 300)
      }
    })
  } catch (error) {
    console.error('Erro ao configurar Hammer.js:', error)
  }
}

const retrySetupEvents = (maxAttempts = 3) => {
  let attempts = 0

  const trySetup = () => {
    if (attempts >= maxAttempts) return

    const iframe = document.querySelector('#area iframe')
    if (iframe?.contentDocument?.body) {
      cleanupTouchEvents()
      setupTouchEvents()
    } else {
      attempts++
      setTimeout(trySetup, 200)
    }
  }

  trySetup()
}

const cleanupTouchEvents = () => {
  if (hammerManager.value) {
    hammerManager.value.destroy()
    hammerManager.value = null
  }
}

onMounted(async () => {
  store.dispatch('initBookMarks')

  // Inicializa Epub
  try {
    const response = await fetch(`/api/livros/${route.params.id}/download`)
    const arrayBuffer = await response.arrayBuffer()

    rendition.value.book = new Epub(arrayBuffer, { encoding: "binary" })

    rendition.value = rendition.value.book.renderTo("area", {
      flow: "paginated",
      method: "continuous",
      width: "inherit",
      height: "90vh",
    })

    rendition.value.display()

    // Tratamento pra mobile
    checkTouchDevice()
    window.addEventListener('resize', checkTouchDevice)

    // Adicionar eventos touch quando o livro for exibido
    rendition.value.on("displayed", () => {
      displaying.value = true
      setupKeyboardControls()
      setupTheme()

      if (isTouchDevice.value) {
        retrySetupEvents()
      }
    })

    // Adicionar listener para mudança de página
    rendition.value.on("relocated", (location) => {
      if (isTouchDevice.value) {
        retrySetupEvents()
      }
    })

    // Tratamento pra mobile
  } catch (error) {
    console.error('Erro ao carregar o livro:', error)
  }
  // Inicializa Epub




  // Não se esqueça de limpar o URL do Blob quando o componente for desmontado
  return () => {
    if (url) URL.revokeObjectURL(url)
  }
})

// Adicionar watch para garantir que os eventos sejam reconfigurados se necessário
watch(() => displaying.value, (newVal) => {
  if (newVal && isTouchDevice.value) {
    retrySetupEvents()
  }
})


onBeforeUnmount(() => {
  cleanupTouchEvents()

  if (keyboardFunctions.value) {
    window.document.removeEventListener("keydown", keyboardFunctions.value)
  }

  window.removeEventListener('resize', checkTouchDevice)

})
</script>

<template>
  <div class="drawer drawer-end" style="height: 92.7vh;">
    <input id="bookmark-drawer" type="checkbox" class="drawer-toggle" />
    <!-- Indicador de carregamento -->
    <div v-if="isChangingPage"
         class="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center">
      <div class="loading loading-spinner loading-lg text-primary"></div>
    </div>

    <div class="drawer-content" >

      <button
          v-show="!isTouchDevice"
          class="btn btn-circle btn-outline absolute xs:bottom-3 sm:inset-y-1/2 left-5 lg:left-20 xs:left-5 z-50"
          @click="rendition.prev()">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
          v-show="!isTouchDevice"
          class="btn btn-circle btn-outline absolute xs:bottom-3 sm:inset-y-1/2 right-5 lg:right-20 xs:right-5 z-50"
          @click="rendition.next()">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      <div class="container mx-auto " >
        <div id="area" >
        </div>
      </div>
    </div

    <div class="drawer-side">
      <label for="bookmark-drawer" class="drawer-overlay"></label>
      <ul class="menu p-4 w-80 bg-base-100 text-base-content min-h-screen" v-if="displaying">
        <div class="flex items-stretch">
          <button class="btn btn-outline btn-success w-1/2
                    rounded-r-none border-r-0" @click="addBookMark()"
                  v-text="'Add BookMark'" />

          <button class="btn btn-outline btn-warning w-1/2
                    rounded-l-none border-l-0" @click="clearBookMarks()"
                  v-text="'Clear BookMarks'" />
        </div>
        <!-- Sidebar content here -->
        <div v-for="(bookMark, index) in getBookMarks" :key="index"
             class="flex justify-center items-stretch mt-2">
          <div class="btn btn-outline w-48 rounded-r-none border-r-0"
               @click="displayPointAt(bookMark.location)"
          >
            {{ labelTocByLocations[bookMark.location.start.href] }}

          </div>
          <div class="max-w-8">
            <button class="btn btn-outline btn-error border-l-0 rounded-l-none"
                    @click="removeBookMark(index)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </ul>
    </div>
  </div>
</template>