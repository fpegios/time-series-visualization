import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    file: {
      name: undefined,
      data: undefined
    },
    filteredData: [],
    spinnerStatus: false
  },
  
  getters: {
    fileName (state) {
      return state.file.name
    },
    fileData (state) {
      return state.file.data
    },
    filteredData (state) {
      return state.filteredData
    },
    spinnerStatus (state) {
      return state.spinnerStatus
    }
  },
  
  mutations: {
    setFileName (state, value) {
      state.file.name = value
    },
    setFileData (state, value) {
      state.file.data = value
    },
    setFilteredData (state, value) {
      state.filteredData = value
    },
    setSpinnerStatus (state, value) {
      state.spinnerStatus = value
    },
  },
  
  actions: {
    showSpinner (context, value = true) {
      context.commit('setSpinnerStatus', value)
    },
  }
})