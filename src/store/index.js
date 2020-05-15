import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    file: {
      name: 'foo.csv',
      data: 'undefined'
    }
  },
  
  getters: {
    fileName (state) {
      return state.file.name
    },
    fileData (state) {
      return state.file.data
    }
  },
  
  mutations: {
    setFileName (state, value) {
      state.file.name = value
    },
    setFileData (state, value) {
      state.file.data = value
    },
  },
  
  actions: {
  }
})