import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    fileName: 'foo.csv'
  },
  
  getters: {
    fileName (state) {
      return state.fileName
    }
  },
  
  mutations: {
    setFileName (state, value) {
      state.fileName = value
    },
  },
  
  actions: {
  }
})