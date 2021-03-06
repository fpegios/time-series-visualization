import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    d3: undefined,
    file: {
      name: undefined,
      data: undefined
    },
    filterDays: undefined,
    filterDateFrom: undefined,
    filterDateTo: undefined,
    filteredData: [],
    filterDate: undefined,
    filterMonth: undefined,
    filterWeek: undefined,
    filterWeekday: undefined,
    filterHour: undefined,
    spinnerStatus: false
  },
  
  getters: {
    d3 (state) {
      return state.d3
    },
    fileName (state) {
      return state.file.name
    },
    fileData (state) {
      return state.file.data
    },
    filterDays (state) {
      return state.filterDays
    },
    filterDateFrom (state) {
      return state.filterDateFrom
    },
    filterDateTo (state) {
      return state.filterDateTo
    },
    filteredData (state) {
      return state.filteredData
    },
    spinnerStatus (state) {
      return state.spinnerStatus
    },
    filterDate (state) {
      return state.filterDate
    },
    filterMonth (state) {
      return state.filterMonth
    },
    filterWeek (state) {
      return state.filterWeek
    },
    filterWeekday (state) {
      return state.filterWeekday
    },
    filterHour (state) {
      return state.filterHour
    }
  },
  
  mutations: {
    setD3 (state, value) {
      state.d3 = value
    },
    setFileName (state, value) {
      state.file.name = value
    },
    setFileData (state, value) {
      state.file.data = value
    },
    setFilterDays(state, value) {
      state.filterDays = value
    },
    setFilterDateFrom (state, value) {
      state.filterDateFrom = value
    },
    setFilterDateTo (state, value) {
      state.filterDateTo = value
    },
    setFilteredData (state, value) {
      state.filteredData = value
    },
    setSpinnerStatus (state, value) {
      state.spinnerStatus = value
    },
    setFilterDate (state, value) {
      state.filterDate = value
    },
    setFilterMonth (state, value) {
      state.filterMonth = value
    },
    setFilterWeek (state, value) {
      state.filterWeek = value
    },
    setFilterWeekday (state, value) {
      state.filterWeekday = value
    },
    setFilterHour (state, value) {
      state.filterHour = value
    }
  },
  
  actions: {
    showSpinner (context, value = true) {
      context.commit('setSpinnerStatus', value)
    },
  }
})