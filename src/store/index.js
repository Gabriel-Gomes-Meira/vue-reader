import { createStore } from 'vuex'

const BOOKMARKS = {
  state: {
    bookMarks:[]
  },

  getters: {
    getBookMarks(state) {
      return state.bookMarks
    }
  },

  mutations: {    
    addBookMark(state, bookMark) {
      state.bookMarks.push(bookMark)
    },

    removeBookMark(state, index) {
      state.bookMarks.splice(index, 1)
    },

    clearBookMarks(state) {
      state.bookMarks = []
    }
  },

  actions: {
    storeBookMark(context){      
      localStorage.setItem('bookMarks', JSON.stringify(context.state.bookMarks))
    },

    initBookMarks(context){
      let item = JSON.parse(localStorage.getItem('bookMarks'));
      if (item) {
        context.state.bookMarks = item
      } 
    },
    
    clearBookMarks({ commit }){
      commit('clearBookMarks')
      localStorage.removeItem('bookMarks')
    }
  }
}

const WORDS = {
  state: {
    voculary: {}    /// estado do vocabulario local
  }, 
  
  getters : {
    getLocalVocabulary(state) {
      return state.vocabulary;
    }
  },

  mutations: {
    /// adicionar no local    
    addToLocalVocabulary(state, data) {
      if (!state.vocabulary[data.srctgt]) {
        state.vocabulary[data.srctgt] = {}
      }

      state.vocabulary[data.srctgt][data.word] = data.translation
    }
  },

  actions: {                
    /// traduzir
    setTranslation({ commit }, data) {
      // fetch("http://localhost:8080/SharedState/vocabulary.json").then(response => {
      //   response.json().then (json => {
      //     if (json[data.srctgt]) {            
            
      //       if (json[data.srctgt][data.word]) {
      //         commit('addToLocalVocabulary', {
      //           srctgt: data.srctgt, 
      //           word: data.word, 
      //           translation: json[data.srctgt][data.word]
      //         })
      //       } else {

      //       }

      //     } else {
            
      //     }
      //   })
      // })            
    }
  }
}


export default createStore({  
  modules: {
    bookmark: BOOKMARKS,
    words: WORDS
  }
})
