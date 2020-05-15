<template>
  <v-app id="app">
    <Navbar v-if="isNavbarVisible()"/>
    <router-view />
  </v-app>
</template>

<script>
import Navbar from './components/Navbar.vue'

export default {
  name: 'App',
  components: {
    Navbar,
  },
  data () {
    return {
      test: this.$store.getters.test
    }
  },
  methods: {
    isNavbarVisible () {
      return this.$route.name !== 'FileUpload'
    }
  },
  computed: {
    
  },
  created() {

  },
  mounted () {

  }
}
</script>

<style lang="scss">
@import 'scss/main.scss';
@import "scss/_colors";

</style>
