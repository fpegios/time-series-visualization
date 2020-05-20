<template>
  <v-container id="filters" fluid class="px-12">
		<v-card max-width="100%">
			<v-card-title>Filter Options</v-card-title>
			<v-card-text>

				<v-row class="mx-0" no-gutters>
					<v-col cols="6"	>
						<v-row class="mx-0">
							<v-col cols="6">
								<v-menu ref="dateFromMenu" v-model="dateFromMenu" transition="scale-transition" offset-y width="290px">
									<template v-slot:activator="{ on }">
										<v-text-field
											v-model="dateFromIsoFormatted"
											label="Date From"
											hint="DD/MM/YYYY format"
											persistent-hint
											prepend-icon="event"
											@change="dateFromIso = parseDate(dateFromIsoFormatted)"
											v-on="on">
										</v-text-field>
									</template>
									<v-date-picker v-model="dateFromIso" no-title @input="dateFromMenu = false"></v-date-picker>
								</v-menu>
							</v-col>

							<v-col cols="6">
								<v-menu ref="dateToMenu" v-model="dateToMenu" transition="scale-transition" offset-y width="290px">
									<template v-slot:activator="{ on }">
										<v-text-field
											v-model="dateToIsoFormatted"
											label="Date To"
											hint="DD/MM/YYYY format"
											persistent-hint
											prepend-icon="event"
											v-on="on"
											@change="dateToIso = parseDate(dateToIsoFormatted)">
										</v-text-field>
									</template>
									<v-date-picker v-model="dateToIso" no-title @input="dateToMenu = false"></v-date-picker>
								</v-menu>
							</v-col>
						</v-row>
					</v-col>
					<v-col cols="6">
						<v-row class="mx-0">
							<v-col cols="12">
								<v-select
									v-model="days"
									:items="daysPicklistValues"
									attach
									label="Days"
									multiple
									@change="onDayPicklistChangeHandler">
								</v-select>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
			</v-card-text>

			<v-card-actions class="px-4 py-4 justify-end">
				<div class="mr-6">
					<span v-if="!filteredData.length" class="mr-6 red--text">No data available with the given filters.</span>
					<span v-if="!days.length" class="red--text">A day option should be selected.</span>
				</div>
				<v-btn color="red" outlined @click="onResetFiltersHandler">Reset Filters</v-btn>
				<v-btn color="red" dark @click="filterData">Find Data</v-btn>
			</v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'Filters',
  data () {
    return {
			dateFromIso: undefined,
			dateFromIsoFormatted: undefined,
      dateFromMenu: false,
			dateToIso: undefined,
			dateToIsoFormatted: undefined,
			dateToMenu: false,
			days: ['All Days'],
			daysPicklistValues: [
				'All Days',
				'Weekdays',
				'Weekends',
				'Mondays',
				'Tuesdays',
				'Wednesdays',
				'Thursdays',
				'Fridays',
				'Saturdays',
				'Sundays'
			]
    }
  },
  computed: {
		fileData () {
			return this.$store.getters.fileData
		},
		filteredData () {
			return this.$store.getters.filteredData
		},
		weekDays () {
			return this.daysPicklistValues.slice(3, 8)
		},
		weekEnds () {
			return this.daysPicklistValues.slice(8, 10)
		},
		filteredDays () {
			let days = []
			
			if (this.days.includes('All Days')) {
				return [0, 1, 2, 3, 4, 5, 6]
			}

			if (this.days.includes('Weekdays')) {
				days.push(1, 2, 3, 4, 5)
			}

			if (this.days.includes('Weekends')) {
				days.push(0, 6)
			}

			if (this.days.includes('Mondays')) days.push(1)
			if (this.days.includes('Tuesdays')) days.push(2)
			if (this.days.includes('Wednesdays')) days.push(3)
			if (this.days.includes('Thursdays')) days.push(4)
			if (this.days.includes('Fridays')) days.push(5)
			if (this.days.includes('Saturdays')) days.push(6)
			if (this.days.includes('Sundays')) days.push(0)

			return days
		},
		dateFrom () {
			const date = new Date(this.dateFromIso)
			date.setHours('00')
			date.setMinutes('00')
			date.setSeconds('0')
			date.setMilliseconds('000')
			return  date
		},
		dateTo () {
			const date = new Date(this.dateToIso)
			date.setHours('23')
			date.setMinutes('59')
			date.setSeconds('59')
			date.setMilliseconds('999')
			return date
		}
	},
	watch: {
		dateFromIso (value) {
			this.dateFromIsoFormatted = this.formatDate(value)

			if (new Date(value) > new Date(this.dateToIso)) {
				this.dateToIso = value
			}
		},
		dateToIso (value) {
			this.dateToIsoFormatted = this.formatDate(value)

			if (new Date(value) < new Date(this.dateFromIso)) {
				this.dateFromIso = value
			}
		},		
	},
  methods: {
		formatDate (date) {
			if (!date) return null

			const [year, month, day] = date.split('-')
			return `${day}/${month}/${year}`
		},
		parseDate (date) {
			if (!date) return null

			const [day, month, year] = date.split('/')
			return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
		},
		filterData () {
			this.$store.dispatch('showSpinner', true)
			
			this.$store.commit('setFilteredData',
				this.fileData.filter(v => {
					if ( this.dateFrom <= v.date && v.date <= this.dateTo && this.filteredDays.includes(v.date.getDay())) {
						return true
					}
					return false
				})
			)

			this.$store.dispatch('showSpinner', false)
		},
		onDayPicklistChangeHandler (event) {
			if (!event.length) return

			const newValue = event[event.length - 1]
			if (newValue == 'All Days') {
				this.days = [newValue]
			} else if (newValue == 'Weekends') {
				this.days = this.days.filter(v => !this.weekEnds.includes(v) && v !== 'All Days')
			} else if (newValue == 'Weekdays') {
				this.days = this.days.filter(v => !this.weekDays.includes(v) && v !== 'All Days')
			} else if (this.weekDays.includes(newValue)) {
				this.days = this.days.filter(v => v !== 'All Days' && v!== 'Weekdays')
			} else if (this.weekEnds.includes(newValue)) {
				this.days = this.days.filter(v => v !== 'All Days' && v!== 'Weekends')
			}
		},
		onResetFiltersHandler () {
			this.$store.commit('setFilteredData', this.fileData)
			this.days = ['All Days']
			this.setDefaultDateRange()
		},
		setDefaultDateRange () {
			this.dateFromIso = new Date(this.fileData[0].date).toISOString().substr(0, 10)
			this.dateFromIsoFormatted = this.formatDate(this.dateFromIso)
			this.dateToIso = new Date(this.fileData[this.fileData.length - 1].date).toISOString().substr(0, 10)
			this.dateToIsoFormatted = this.formatDate(this.dateToIso)
		}
  },
  created() {

  },
  mounted () {
		this.setDefaultDateRange()
		this.filterData()
  }
}
</script>

<style lang="scss" scoped>
@import "../scss/_colors";

</style>
