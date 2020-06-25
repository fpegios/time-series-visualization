<template>
  <v-container id="navbar" fluid class="px-0 pt-0">
    <v-toolbar color="cyan lighten-1" dense dark class="d-flex justify-center">
      <v-tabs>
        <v-tab to="/">Statistics</v-tab>
        <v-tab to="/calendar">Calendar</v-tab>
      </v-tabs>

      <v-spacer></v-spacer>
      
      <v-btn small color="red" to="/file-upload">CHANGE DATA</v-btn>
    </v-toolbar>
  </v-container>
</template>

<script>
export default {
  name: 'Navbar',
  data () {
    return {

    }
  },
  computed: {
    
  },
  methods: {

  },
  created() {

  },
  mounted () {

  }
}
</script>

<style lang="scss">
@import "../scss/_colors";

.v-toolbar {
  &__content {
    width: 100%;
    max-width: 1200px!important;
    padding: 0 30px;
  }
}
</style>
