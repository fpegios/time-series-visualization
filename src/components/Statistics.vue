<template>
  <v-container id="statistics">
    <h1>STATISTICS</h1>
    {{ filteredData }}
  </v-container>
</template>

<script>
export default {
  name: 'Statistics',
  props: {
    msg: String
  },
  computed: {
    filteredData () {
      return this.$store.getters.filteredData
    }
  }
}
</script>

<style scoped>

</style>
