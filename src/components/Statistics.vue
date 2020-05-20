<template>
  <v-container id="statistics" fluid class="px-12">
    <v-card max-width="100%">
			<v-card-title>Statistics</v-card-title>
      <v-card-text>
				<v-row class="mx-0" no-gutters>
					<v-col cols="12">
            <DayHistogram :data="filteredData"/>
					</v-col>
				</v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import DayHistogram from './DayHistogram.vue'

export default {
  name: 'Statistics',
  components: {
    DayHistogram,
  },
  props: {
  },
  data () {
    return {
      data: []
    }
  },
  computed: {
    d3 () {
      return this.$store.getters.d3
    },
    filteredData () {
      return this.$store.getters.filteredData
    }
  },
  methods: {
    
  },
  mounted () {
      
  }
}
</script>

<style lang="scss">
@import "./../scss/_colors";



</style>
