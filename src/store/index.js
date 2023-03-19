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

export default createStore({  
  modules: {
    bookmark: BOOKMARKS,    
  }
})
