<template>
  <v-app id="app">
    <v-overlay v-if="$store.getters.spinnerStatus">
      <v-progress-circular :size="70" :width="7" color="cyan lighten-1" indeterminate ></v-progress-circular>
    </v-overlay>

    <Navbar v-if="!isFileUploadRoute"/>
    <Filters v-if="!isFileUploadRoute"/>

    <router-view />
  </v-app>
</template>

<script>
import Filters from './components/Filters.vue'
import Navbar from './components/Navbar.vue'
import * as d3 from 'd3'

export default {
  name: 'App',
  components: {
    Filters,
    Navbar,
  },
  data () {
    return {

    }
  },
  methods: {
    
  },
  computed: {
    isFileUploadRoute () {
      return this.$route.name === 'FileUpload'
    }
  },
  created() {
    this.$store.commit('setD3', d3)
  },
  mounted () {

  }
}
</script>

<style lang="scss">
@import 'scss/main.scss';
@import "scss/_colors";

.v-progress-circular {
  position: fixed!important;
  top: 0;
  left: 0;
  width: 100%!important;
  height: 100%!important;
  z-index: 100;

  svg {
    width: 20%!important;
  }
}

</style>
