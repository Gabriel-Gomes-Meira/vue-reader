// store/index.js
import { createStore } from 'vuex'

const store = createStore({
    modules: {
        bookmark: {
            state: () => ({
                bookMarks: []
            }),

            getters: {
                getBookMarks: (state) => state.bookMarks
            },

            mutations: {
                SET_BOOKMARKS: (state, bookmarks) => {
                    state.bookMarks = bookmarks
                },
                ADD_BOOKMARK(state, bookmark) {
                    state.bookMarks.push(bookmark)
                },
                REMOVE_BOOKMARK: (state, index) => {
                    state.bookMarks.splice(index, 1)
                },
                CLEAR_BOOKMARKS: (state, bookId) => {
                    state.bookMarks = state.bookMarks.filter(item => item.bookId !== bookId)
                }
            },

            actions: {
                storeBookMark({ state }) {
                    if (process.client) {
                        localStorage.setItem('bookMarks', JSON.stringify(state.bookMarks))
                    }
                },

                initBookMarks({ commit }) {
                    if (process.client) {
                        const bookmarks = localStorage.getItem('bookMarks')
                        if (bookmarks) {
                            commit('SET_BOOKMARKS', JSON.parse(bookmarks))
                        }
                    }
                },

                addBookMark({ commit, dispatch }, bookmark) {
                    commit('ADD_BOOKMARK', bookmark)
                    dispatch('storeBookMark')
                },

                removeBookMark({ commit, dispatch }, index) {
                    commit('REMOVE_BOOKMARK', index)
                    dispatch('storeBookMark')
                },
            }
        }
    }
})

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(store)
    return {
        provide: {
            store
        }
    }
})