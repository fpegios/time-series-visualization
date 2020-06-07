<template>
  <v-container id="statistics">
    <v-card max-width="100%">
      <v-card-text>
				<v-row class="mx-0 mb-8" no-gutters>
					<v-col cols="12">
            <DayHistogram :data="filteredData"/>
					</v-col>
				</v-row>
				<v-row class="mx-0 mb-8" no-gutters>
          <v-col cols="6">
            <MonthDonut :data="filteredData"/>
					</v-col>
          <v-col cols="6">
            <WeekBarplot :data="filteredData"/>
					</v-col>
				</v-row>
				<v-row class="mx-0" no-gutters>
          <v-col cols="6">
            <WeekdayDonut :data="filteredData"/>
					</v-col>
          <v-col cols="6">
            <HourAsterplot :data="filteredData"/>
					</v-col>
				</v-row>
        <v-row class="mx-0 mt-8 justify-center" no-gutters>
          <v-col cols="10">
            <MinuteBarplot :data="filteredData"/>
          </v-col>
				</v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import DayHistogram from './graphs/DayHistogram.vue'
import MonthDonut from './graphs/MonthDonut.vue'
import WeekdayDonut from './graphs/WeekdayDonut.vue'
import WeekBarplot from './graphs/WeekBarplot.vue'
import HourAsterplot from './graphs/HourAsterplot.vue'
import MinuteBarplot from './graphs/MinuteBarplot.vue'

export default {
  name: 'Statistics',
  components: {
    DayHistogram,
    MonthDonut,
    WeekdayDonut,
    WeekBarplot,
    HourAsterplot,
    MinuteBarplot
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

h2 {
  color: $black;
  font-size: 1.25em;
}

</style>
