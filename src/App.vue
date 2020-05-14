<template>
  <v-app id="app">
    <Navbar />
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
