<template>
  <div id="navbar">
    <v-card color="grey lighten-4" flat tile>
      <v-toolbar color="cyan lighten-1" dense dark class="px-12">
        <v-tabs>
            <v-tab to="/">Statistics</v-tab>
            <v-tab to="/calendar">Calendar</v-tab>
        </v-tabs>

        <v-spacer></v-spacer>
        
        <v-btn small color="red" @click.stop="dialog = true">CHANGE DATA</v-btn>
      </v-toolbar>
    </v-card>

    <v-dialog v-model="dialog" max-width="450px">
      <v-card>
        <v-card-title class="headline">Would you like to change your data?</v-card-title>

        <v-card-text>Current file: {{ $store.getters.fileName }}</v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="dialog = false">No</v-btn>
          <v-btn color="red darken-1" text @click="dialog = false" to="/">Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'Navbar',
  data () {
    return {
      dialog: false
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
