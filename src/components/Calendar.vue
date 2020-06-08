<template>
  <v-container id="calendar">
    <v-card max-width="100%">
      <v-card-text>
        <h2 class="text-center">{{ title }}</h2>

        <v-row class="mx-0">
          <v-col cols="12" class="d-flex flex-grow">
            <div v-if="leftIndex > 0" class="d-flex align-center mb-12">
              <v-icon class="arrow" color="cyan lighten-1" @click="onArrowClickHandler(-1)">arrow_left</v-icon>
            </div>
            <div v-else class="d-flex align-center mb-12">
              <v-icon class="arrow disabled" color="grey">arrow_left</v-icon>
            </div>

            <div class="flex-grow-1">
              <div class="calendar-table">
                <div class="calendar-table__column label mr-1" :style="getColumnWidth(1)">
                  <div class="header"></div>
                  <div class="hour" v-for="(hour, index) in hours" :key="index">
                    <span>{{ getTwoDigitForm(index) }}:00</span>
                  </div>
                </div>
                <div class="calendar-table__column" :style="getColumnWidth()" v-for="d in data" :key="d.id">
                  <div class="header" :class="{ weekend: isWeekend(d.date) }">
                    <span>{{ getWeekday(d.date) }}</span>
                    <span>{{ getDateFormat(d.date) }}</span>
                  </div>
                  <div class="hour" :class="getHourClass(d.date, hour.numOfObservations)" v-for="hour in d.hourGroupData" :key="hour.id">
                    <span>{{ hour.numOfObservations }}</span>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-end my-5">
                <div class="legend">
                  <div class="legend-parts d-flex">
                    <div class="gradient-0"></div>
                    <div class="gradient-1"></div>
                    <div class="gradient-2"></div>
                    <div class="gradient-3"></div>
                    <div class="gradient-4"></div>
                    <div class="gradient-5"></div>
                    <div class="gradient-6"></div>
                  </div>
                  <div class="d-flex justify-space-between">
                    <span>1</span>
                    <span>{{ maxNumOfObservations_hour }}</span>
                  </div>
                </div>
              </div>

              <div class="calendar-table">
                <div class="calendar-table__column label mr-1" :style="getColumnWidth(1)">
                  <span class="hour">Total</span>
                </div>
                <div class="calendar-table__column" :style="getColumnWidth()" v-for="d in data" :key="d.id">
                  <div class="hour total" :class="getDayClass(d.date, d.totalNumOfObservations)">
                    <span>{{ d.totalNumOfObservations }}</span>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-end mt-5">
                <div class="legend">
                  <div class="legend-parts d-flex">
                    <div class="gradient-0"></div>
                    <div class="gradient-1"></div>
                    <div class="gradient-2"></div>
                    <div class="gradient-3"></div>
                    <div class="gradient-4"></div>
                    <div class="gradient-5"></div>
                    <div class="gradient-6"></div>
                  </div>
                  <div class="d-flex justify-space-between">
                    <span>1</span>
                    <span>{{ maxNumOfObservations_day }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="rightIndex < dayGroupData.length" class="d-flex align-center mb-12">
              <v-icon class="arrow" color="cyan lighten-1" @click="onArrowClickHandler(1)">arrow_right</v-icon>
            </div>
            <div v-else class="d-flex align-center mb-12">
              <v-icon class="arrow disabled" color="grey">arrow_right</v-icon>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card> 
  </v-container>
</template>

<script>
export default {
  name: 'Calendar',
  data () {
    return {
      title: 'Calendar',
      maxCells: 30,
      shift: 0,
      dayGroupData: [],
			weekdayNames: [
				'Sunday',
				'Monday',
				'Tuesday',
				'Wednesday',
				'Thursday',
				'Friday',
				'Saturday'
      ],
      maxNumOfObservations_hour: 0,
      maxNumOfObservations_day: 0,
      hours: new Array(24)
    }
  },
  computed: {
    data () {
      return this.dayGroupData.slice(this.leftIndex, this.rightIndex + 1)
    },
    filteredData () {
      return this.$store.getters.filteredData
    },
    leftIndex () {
      return 0 + this.shift
    },
    rightIndex () {
      return this.maxCells - 1 + this.shift
    },
    filterDateFrom () {
      return this.$store.getters.filterDateFrom
    },
    filterDateTo () {
      return this.$store.getters.filterDateTo
    },
    filterDays() {
      return this.$store.getters.filterDays
    },
  },
  watch: {
    filteredData () {
      this.shift = 0
      this.maxNumOfObservations_hour = 0
      this.maxNumOfObservations_day = 0
			this.onDataSetHandler(this.filteredData)
		}
  },
  methods: {
    getColumnWidth (label = undefined) {
      return `width: 100%; ${label ? 'max-width' : 'min-width'}: ${(100 / (this.maxCells + 1))}%`
    },
		getTwoDigitForm (number) {
			return ('0' + number).slice(-2)
		},
    getRandomId () {
      return Math.floor(Math.random() * 10000000)
    },
    getDateFormat (date) {
      return `${date.getDate()}/${date.getMonth() + 1}`
    },
    getWeekday (date) {
      return this.weekdayNames[date.getDay()].substring(0, 3)
    },
    isWeekend (date) {
      return date.getDay() === 6 || date.getDay() === 0
    },
    getHourClass (date, numOfObservations) {
      let classList = ''
      if (this.isWeekend(date)) {
        classList = classList.concat('weekend')
      }

      if (numOfObservations === 0) {
        return classList
      }

      return classList.concat(` gradient-${parseInt((numOfObservations * 6) / this.maxNumOfObservations_hour)}`)
    },
    getDayClass (date, numOfObservations) {
      let classList = ''
      if (this.isWeekend(date)) {
        classList = classList.concat('weekend')
      }

      if (numOfObservations === 0) {
        return classList
      }

      return classList.concat(` gradient-${parseInt((numOfObservations * 6) / this.maxNumOfObservations_day)}`)
    },
    getDaysBetweenTwoDates (start, end) {
      let arr
      let dt
      for (arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt));
      }

      // filter on days
      return arr.filter(d => {
        if (this.filterDays.includes('All Days')) return true

        if (d.getDay() === 1 && this.filterDays.includes('Mondays')) return true
        if (d.getDay() === 2 && this.filterDays.includes('Tuesdays')) return true
        if (d.getDay() === 3 && this.filterDays.includes('Wednesdays')) return true
        if (d.getDay() === 4 && this.filterDays.includes('Thursdays')) return true
        if (d.getDay() === 5 && this.filterDays.includes('Fridays')) return true
        if (d.getDay() === 6 && this.filterDays.includes('Saturdays')) return true
        if (d.getDay() === 0 && this.filterDays.includes('Sundays')) return true
        if (d.getDay() > 0 && d.getDay() < 6 && this.filterDays.includes('Weekdays')) return true
        if ((d.getDay() > 5 || d.getDay() < 1) && this.filterDays.includes('Weekends')) return true

        return false
      })
    },
    getDayGroupData (data) {
			if (!data || !data.length) return false
      const startDate = this.filterDateFrom.getDate() === data[0].date.getDate()
        && this.filterDateFrom.getMonth() === data[0].date.getMonth()
        && this.filterDateFrom.getFullYear() === data[0].date.getFullYear()
          ? data[0].date
          : this.filterDateFrom

      const endDate = this.filterDateTo.getDate() === data[data.length - 1].date.getDate()
        && this.filterDateTo.getMonth() === data[data.length - 1].date.getMonth()
        && this.filterDateTo.getFullYear() === data[data.length - 1].date.getFullYear()
          ? data[data.length - 1].date
          : this.filterDateTo

      const days = this.getDaysBetweenTwoDates(startDate, endDate)
      if (!days.length) return false

      const dayGroupData = []
      
      days.forEach(d => {
        const dayData = data.filter(fd =>
          fd.date.getDate() === d.getDate()
          && fd.date.getMonth() === d.getMonth()
          && fd.date.getFullYear() === d.getFullYear()
        )
        let numOfObservations_day = 0

        const hourGroupData = []
        for (let i = 0; i < 24; i++) {
          const numOfObservations_hour = dayData.filter(d => d.date.getHours() === i).length
          this.maxNumOfObservations_hour = numOfObservations_hour > this.maxNumOfObservations_hour
            ? numOfObservations_hour
            : this.maxNumOfObservations_hour

          hourGroupData.push({
            id: this.getRandomId(),
            hour: i,
            numOfObservations: numOfObservations_hour
          })
          numOfObservations_day = numOfObservations_day + numOfObservations_hour
        }

        this.maxNumOfObservations_day = numOfObservations_day > this.maxNumOfObservations_day
            ? numOfObservations_day
            : this.maxNumOfObservations_day

        dayGroupData.push({
          id: this.getRandomId(),
          numOfObservations: dayData.length,
          hourGroupData,
          date: d,
          totalNumOfObservations: numOfObservations_day
        })
      })

      return dayGroupData
		},
		onDataSetHandler (data) {
      this.dayGroupData = this.getDayGroupData(data)
    },
    onArrowClickHandler (shift) {
      this.shift = this.shift + shift
    }
  },
  mounted () {
    this.onDataSetHandler(this.filteredData)
  }
}
</script>

<style scoped lang="scss">
@import "./../scss/_colors";

.calendar-table {
  display: flex;
  flex: 1;

  &__column {
    .header {
      background-color: $cyan;
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-left: 1px solid $grey;
      border-bottom: 1px solid $grey;
      text-align: center;
      height: 30px;

      &.weekend {
        background-color: darken($color: $cyan, $amount: 10);
      }
    }

    .hour {
      text-align: center;
      border-left: 1px solid $grey;
      border-bottom: 1px solid $grey;
      height: 23px;
      display: flex;
      justify-content: center;
      align-items: center;

      &.total {
        border-top: 1px solid $grey;
      }

      &.weekend {
        background-color: lightgrey;
      }
    }

    .header {
      font-size: .65em;
      font-weight: bold;
    }
    .hour {
      font-size: .75em;
      font-weight: bold;
    }

    &.label {
      width: auto;
      .header,
      .hour {
        font-size: .75em;
        font-weight: normal;
        border: none;
        background-color: white;
      }
    }

    &:last-child {
      .header,
      .hour {
        border-right: 1px solid $grey;
      }
    }
  }
}

.arrow {
  cursor: pointer;
  font-size: 120px!important;
  max-width: 40px;

  &:not(.disabled) {
    &:hover {
      transform: scale(1.2);
    }
    &:active {
      transform: scale(1);
    }
  }

  &:focus::after {
    display: none
  }
}

.legend {
  font-size: .8em;
}

.legend-parts {
  > div {
    width: 60px;
    height: 10px;
    &:not(:last-child) {
      margin-right: 5px;
    }
  }
}

span {
  line-height: 1.5em;
}
  
.gradient-0 {
  background-color: #fbfcc9!important;
}

.gradient-1 {
  background-color: #f1f2a9!important;
}

.gradient-2 {
  background-color: #f0f28a!important;
}

.gradient-3 {
  background-color: #edef5b!important;
}

.gradient-4 {
  background-color: #FB9F59!important;
}

.gradient-5 {
  background-color: #F47245!important;
}

.gradient-6 {
  background-color: #E1514B!important;
}

</style>
