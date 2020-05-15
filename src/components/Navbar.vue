<template>
  <div id="navbar">
    <v-card color="grey lighten-4" flat tile>
      <v-toolbar color="cyan lighten-1" dense dark class="px-12">
        <v-tabs>
            <v-tab to="/">Statistics</v-tab>
            <v-tab to="/calendar">Calendar</v-tab>
        </v-tabs>

        <v-spacer></v-spacer>
        
        <v-btn small color="red" to="/file-upload">CHANGE DATA</v-btn>
      </v-toolbar>
    </v-card>
  </div>
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

<style lang="scss" scoped>
@import "../scss/_colors";

</style>
