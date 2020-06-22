<template>
	<div :class="svgWrapperSelector">
		<h2 class="text-center">{{ title }}</h2>
		<div :id="svgWrapperSelector"></div>
	</div>
</template>

<script>
export default {
  name: 'DayHistogram',
  props: [
		'data'
	],
  data () {
    return {
			svgWrapperSelector: 'day-histogram',
			title: 'Observations per day',
			axisLabels: {
				x: 'Days',
				y: 'Observations'
			},
			isFiltered: false,
			svgMargin: {
        top: 20,
        right: 30,
        bottom: 60,
        left: 65
			},
			svgHeight: 220
    }
  },
  computed: {
    d3 () {
      return this.$store.getters.d3
    },
    filteredData () {
      return this.data.filter(v => {
				if (this.filter.month && this.filter.month !== v.date.getMonth()) return false
				if (this.filter.week && this.filter.week !== v.week) return false
				if (this.filter.weekday && this.filter.weekday !== v.date.getDay()) return false
				if (this.filter.hour && this.filter.hour !== v.date.getHours()) return false
				
				return true
			})
		},
    filter () {
      return {
				month: this.$store.getters.filterMonth,
				week: this.$store.getters.filterWeek,
				weekday: this.$store.getters.filterWeekday,
				hour: this.$store.getters.filterHour
			}
		},
		svgWrapper () {
			return this.d3.select(`#${this.svgWrapperSelector}`)
		},
		svgWrapperRect () {
			return this.svgWrapper.node().getBoundingClientRect()
		},
    filterDateFrom () {
      return this.$store.getters.filterDateFrom
    },
    filterDateTo () {
      return this.$store.getters.filterDateTo
    }
	},
	watch: {
		data () {
			this.onDataSetHandler(this.filteredData)
		},
		filter (newValue, oldValue) {
			if (oldValue && !this.isFiltered) this.onDataSetHandler(this.filteredData)
		}
	},
  methods: {
    getWeek (d) {
      // Source: https://weeknumber.net/how-to/javascript
      const date = new Date(d)
      date.setHours(0, 0, 0, 0)
      // Thursday in current week decides the year.
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
      // January 4 is always in week 1.
      const week1 = new Date(date.getFullYear(), 0, 4);
      // Adjust to Thursday in week 1 and count number of weeks from date to week1.
      return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
    },
    renderHistogram (data) {			
      const width = this.svgWrapperRect.width - this.svgMargin.left - this.svgMargin.right
			const height = this.svgHeight - this.svgMargin.top - this.svgMargin.bottom

			const tooltip = this.svgWrapper
				.append('div')
        .attr('class', 'tooltip hidden')

      const svg = this.svgWrapper
        .append('svg')
        .attr('width', width + this.svgMargin.left + this.svgMargin.right)
        .attr('height', height + this.svgMargin.top + this.svgMargin.bottom)
        .append('g')
        .attr('transform', `translate(${this.svgMargin.left}, ${this.svgMargin.top})`);

			const x = this.d3.time.scale().range([0, width]);
			const y = this.d3.scale.linear().range([height, 0])
			
      const xAxis = this.d3.svg.axis().scale(x).orient('bottom')
        .tickFormat(this.d3.time.format('%d %b %y'))
        .tickSize(5)
      
			const yAxis = this.d3.svg.axis().scale(y).orient('left')
				.ticks(6)
        .tickSize(5)

      // Set the x and y scales to the data ranges x based on min and
			// max date range (this.d3.extent()) and y based on 0 to max value
			const maxObservations = this.d3.max(data, d => d.numOfObservations)
      x.domain(this.d3.extent(data, d => d.date))
			y.domain([0, maxObservations])

      // Create bar and append data.close and x position set based on barWidth equidistant
      const barWidth = width / data.length

      const bar = svg.selectAll('g')
        .data(data)
        .enter()
        .append('g')
				.attr('transform', (d, i) => `translate(${i * barWidth}, 0)`)

			const that = this
      // Add rectangles to bar 
      bar.append('rect')
        .attr('class', 'bar')
        .attr('y', d => y(d.numOfObservations))
        .attr('width', barWidth - 2)
				.attr('height', d => height - y(d.numOfObservations))
				.on('mouseover', function (d) {
					that.d3.select(this).classed('hovered', true)
					that.showTooltip(tooltip, d)
				})
				.on('mousemove', d => {
					this.showTooltip(tooltip, d)
				})
				.on('mouseout', function () {
					that.d3.select(this).classed('hovered', false)
					tooltip.classed('hidden', true)
				})

      svg.append('g')
        .attr('class', 'axis axis-x')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'center')
        .attr('dx', '0')
				.attr('dy', '15')

			svg.select('.axis-x')
				.append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2 - 40)
        .attr('y', 55)
        .text(this.axisLabels.x)

      svg.append('g')
        .attr('class', 'axis axis-y')
        .call(yAxis)
        .append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height + (height / 5))
        .attr('y', -40)
				.text(this.axisLabels.y)
				
			// draw line of mean number of observations
			const meanObservations = data.reduce((accum, item) => accum + item.numOfObservations, 0) / data.length
			const meanLineHeight = height - (meanObservations / maxObservations) * height

			svg.append('line')
				.attr('class', 'mean-line')
				.attr('x1', 0)
				.attr('x2', width)	
				.attr('y1', meanLineHeight)
				.attr('y2', meanLineHeight)
				.attr('stroke', '#f44336')
				.attr('stroke-width', 2)
    },
    getDaysBetweenTwoDates (start, end) {
      for (var arr=[], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
          arr.push(new Date(dt));
      }
      return arr
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

      const dataPerDay = this.getDaysBetweenTwoDates(startDate, endDate)
			if (!dataPerDay.length) return false

			const res = dataPerDay
				.filter(v => {
					if (this.filter.month && this.filter.month !== v.getMonth()) return false
					if (this.filter.week && this.filter.week !== this.getWeek(v)) return false
					if (this.filter.weekday && this.filter.weekday !== v.getDay()) return false
					
					return true
				})
				.map(d => {
					d.date = d
					const observationsByDate = data.filter(fd =>
						fd.date.getDate() === d.getDate()
						&& fd.date.getMonth() === d.getMonth()
						&& fd.date.getFullYear() === d.getFullYear()
					)
					
					d.numOfObservations = observationsByDate.length

					return d
				})
			
				return res
		},
		onDataSetHandler (data) {
			this.d3.select(`#${this.svgWrapperSelector} svg`).remove()
			this.d3.select(`#${this.svgWrapperSelector} .tooltip`).remove()
			
			const dayGroupData = this.getDayGroupData(data)
			if (!dayGroupData || !dayGroupData.length) return
			
			this.renderHistogram(dayGroupData)
		},
		showTooltip (tooltip, d) {
			tooltip
				.classed('hidden', false)
				.style('left', `${this.d3.event.offsetX - 40}px`)
				.style('top', `${this.d3.event.offsetY - 40}px`)
				.html(
					`<span>${d.date.getDate()}-${d.date.getMonth() + 1}-${d.date.getFullYear()}</span>` +
					`<span>${d.numOfObservations} observations</span>`
				)
		}
  },
  mounted () {
		this.onDataSetHandler(this.filteredData)
  }
}
</script>

<style lang="scss">
@import "./../../scss/_colors";

.day-histogram {
	position: relative;

	.bar {
		fill: $cyan!important;
		shape-rendering: crispEdges;
		&.hovered {
			fill: darken($cyan, 10%)!important;
		}
	}

	.axis path,
	.axis line {
		fill: none;
		stroke: #000;
		shape-rendering: crispEdges;
	}

	.axis-label {
		font-size: 1.1em;
	}

	.tooltip {
		position: absolute;
		top: 0;
		left: 0;
		background-color: white;
		border-radius: 4px;
		border: 1px solid black;
		padding: 5px;
		pointer-events: none;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: black;

		&.hidden {
			display: none;
		}
	}
}

</style>
