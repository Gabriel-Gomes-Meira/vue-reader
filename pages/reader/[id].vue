<script setup>
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import {useStore} from 'vuex'
import {useRoute} from 'vue-router'
import Epub from 'epubjs'

const { $hammer } = useNuxtApp()
const { protocol, host } = useRequestURL()


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

const selectedWord = ref('')
const tooltipPosition = ref({ top: 0, left: 0 })
const showingTooltip = ref(false)
const tooltip = ref(null)
const translation = ref('') // Tradução a ser inserida
const words = ref([])


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

const showTooltip = (selectedText, rect) => {
  selectedWord.value = selectedText
  tooltipPosition.value = {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX
  }
  showingTooltip.value = true
}

const saveTranslation = async () => {
  try {
    // Salvar a word
    const wordResponse = await fetch('/api/words', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ term: selectedWord.value, translate: translation.value }),
    });

    const wordData = await wordResponse.json();

    if (!wordResponse.ok) {
      console.error('Erro ao salvar word:', wordData);
    }
  } catch (error) {
    console.error('Erro ao salvar tradução:', error);
  } finally {
    // Fechar o tooltip e limpar o campo de tradução
    showingTooltip.value = false;
    translation.value = '';
    await getSavedWordWithTranslation()
  }
};

const getSavedWordWithTranslation = async () => {
  const response = await fetch(`/api/words`)
  words.value = await response.json()

  if (rendition.value && rendition.value.getContents) {
    const contents = rendition.value.getContents();
    contents.forEach((content) => {
      highlightWords(content.document, words.value);
    });
  }
}

const closeTooltip = () => {
  showingTooltip.value = false
}

const handleClickOutside = (event) => {
  if (tooltip.value && !tooltip.value.contains(event.target)) {
    closeTooltip()
  }
}

function highlightWords(contentDocument, wordsSalvas) {
  /**
  const link = contentDocument.createElement("link");
  link.rel = "stylesheet";
  link.href = `${protocol}//${host}/highlight.css`; // Usando a URL dinâmica
  contentDocument.head.appendChild(link);

  const script = contentDocument.createElement("script");
  script.src = `${protocol}//${host}/iframe.js`;
  contentDocument.head.appendChild(script);*/

  wordsSalvas.forEach((word) => {
    const translatesText = word.translates.map((translate) => translate.translate).join('</br>');

    let replaced = false;

    // Buscar todos os elementos de texto (como parágrafos, divs, etc.)
    const elements = contentDocument.body.querySelectorAll('p, span, h1, h2, h3, h4, h5'); // Adicione mais tipos de elementos, se necessário

    elements.forEach((element) => {
      const regex = new RegExp(`\\b${word.term}\\b`, "i");

      if (regex.test(element.textContent)) {
        // Substitui apenas a primeira ocorrência dentro do conteúdo do elemento
        const newContent = element.innerHTML.replace(regex, (matched) => {
          if (!replaced) {
            replaced = true;
            // Usa o matched (o texto encontrado) no lugar de word.term
            const tooltipTemplate = `
              <div class="highlight tooltip " >
                  <div class="tooltip-content no-text-indent">
                    <div class="card p-0 card-xs">
                      <div class="card-body">
                          ${translatesText}
                      </div>
                    </div>
                  </div>
                  <span class="bg-base-content text-base-100">${matched}</span>
              </div>
            `;
            return tooltipTemplate; // Aplica o tooltip no texto encontrado
          }
          return matched; // Não substitui as ocorrências subsequentes, mantendo o texto original
        });

        element.innerHTML = newContent; // Atualiza o conteúdo com o novo HTML
      }
    });
  });
}

onMounted(async () => {
  store.dispatch('initBookMarks')
  await getSavedWordWithTranslation()

  // Adicionar o listener de clique fora quando o componente for montado
  window.addEventListener('click', handleClickOutside)
  // Adiciona um listener para a comunicação com o iframe
  window.addEventListener('message', (event) => {
    if (event.data === 'clickOutsideIframe') {
      closeTooltip() // Fecha o tooltip quando a mensagem do iframe for recebida
    }
  })

  try {
    const response = await fetch(`/api/books/${route.params.id}/download`)
    const arrayBuffer = await response.arrayBuffer()

    rendition.value.book = new Epub(arrayBuffer, { encoding: "binary" })

    rendition.value = rendition.value.book.renderTo("area", {
      flow: "paginated",
      method: "continuous",
      width: "inherit",
      height: "90vh",
      script: `${protocol}//${host}/iframe.js`,
      style: `${protocol}//${host}/highlight.css`,
    })

    rendition.value.display()

    // Detecção de seleção de texto
    rendition.value.on('rendered', () => {
      const contents = rendition.value.getContents();

      const tailwindJsUrl = 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'
      const daisyUiCssUrl = 'https://cdn.jsdelivr.net/npm/daisyui@5'
      const daisyUiThemesUrl = 'https://cdn.jsdelivr.net/npm/daisyui@5/themes.css'

      contents.forEach((content) => {

        const linkDaisyUiCss = content.document.createElement('link')
        linkDaisyUiCss.rel = 'stylesheet'
        linkDaisyUiCss.href = daisyUiCssUrl
        linkDaisyUiCss.type = 'text/css'
        content.document.head.appendChild(linkDaisyUiCss)
        const linkTailwindJs = content.document.createElement('script')
        linkTailwindJs.src = tailwindJsUrl
        linkTailwindJs.type = 'text/javascript'
        content.document.head.appendChild(linkTailwindJs)
        const linkDaisyUiThemes = content.document.createElement('link')
        linkDaisyUiThemes.rel = 'stylesheet'
        linkDaisyUiThemes.href = daisyUiThemesUrl
        linkDaisyUiThemes.type = 'text/css'
        content.document.head.appendChild(linkDaisyUiThemes)
        content.document.querySelector('html').setAttribute('data-theme', 'night')


        highlightWords(content.document, words.value);
      });


      const iframe = document.querySelector('#area iframe')
      const iframeWindow = iframe.contentWindow
      const iframeDocument = iframeWindow.document

      iframeDocument.addEventListener("mouseup", function() {
        const selection = iframeWindow.getSelection()
        const selectedText = selection.toString().trim()

        if (selectedText) {
          // Exibe o tooltip com a word selecionada
          showTooltip(selectedText, selection.getRangeAt(0).getBoundingClientRect())
        }
      })

    })

    rendition.value.on('selected', (cfiRange, contents) => {
      console.log('selected', cfiRange, contents)
    })

    // Tratamento para dispositivos móveis
    checkTouchDevice()
    window.addEventListener('resize', checkTouchDevice)

    rendition.value.on("displayed", () => {
      displaying.value = true
      setupKeyboardControls()
      //setupTheme()

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
    console.error('Erro ao carregar o book:', error)
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
  window.removeEventListener('click', handleClickOutside)
  window.removeEventListener('message', () => {}) // Remover o listener
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

      <!-- Tooltip/Modal -->
      <Transition >
        <div
            ref="tooltip"
            v-if="showingTooltip"
            :style="{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }"
            class="absolute border p-4 rounded-md shadow-lg z-10 bg-base-100"
        >
          <div class="flex items-center">
            <input
                v-model="translation"
                type="text"
                class="input input-bordered w-48"
                :placeholder="selectedWord"
            />
            <button @click.stop="saveTranslation" class="btn btn-primary btn-sm ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>

            </button>
          </div>
        </div>
      </Transition>
    </div>

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

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
iframe {
  -webkit-user-select: text;
  -moz-user-select: text;
  user-select: text;
}
</style>