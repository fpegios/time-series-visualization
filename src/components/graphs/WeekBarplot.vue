<template>
	<div :class="svgWrapperSelector">
		<h2 class="text-center">{{ title }}</h2>
		<div :id="svgWrapperSelector"></div>
	</div>
</template>

<script>
export default {
  name: 'WeekBarplot',
  props: [
		'data'
	],
  data () {
    return {
			svgWrapperSelector: 'week-barplot',
			title: 'Day average observations per week',
			axisLabels: {
				x: 'Weeks',
				y: 'Observations'
			},
			svgMargin: {
        top: 40,
        right: 80,
        bottom: 100,
        left: 100
			},
			isFiltered: false
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
    renderBarplot (data) {
			const that = this
			const width = this.svgWrapperRect.width - this.svgMargin.left - this.svgMargin.right
			const height = width / 2

			const tooltip = this.svgWrapper
				.append('div')
        .attr('class', 'tooltip hidden')

			var x = this.d3.scale.ordinal().rangeRoundBands([0, width], .05);
			var y = this.d3.scale.linear().range([height, 0])

			var xAxis = this.d3.svg.axis()
					.scale(x)
					.orient('bottom')
					.tickSize(5)

			var yAxis = this.d3.svg.axis()
					.scale(y)
					.orient('left')
					.tickSize(5)

			var svg = this.svgWrapper
				.append('svg')
				.attr('width', width + this.svgMargin.left + this.svgMargin.right)
				.attr('height', height + this.svgMargin.top + this.svgMargin.bottom)
				.append('g')
				.attr('transform',  `translate(${this.svgMargin.left}, ${this.svgMargin.top})`)

			const maxObservations = this.d3.max(data, d => { return d.averageObservationsPerDay })
			x.domain(data.map(function(d) { return d.weekYear }))
			y.domain([0, maxObservations])

			svg.selectAll('bar')
				.data(data)
				.enter()
				.append('rect')
				.attr('class', 'bar')
				.attr('x', d => {
					return x(d.weekYear)
				})
				.attr('width', x.rangeBand())
				.attr('y', d => {
					return y(d.averageObservationsPerDay)
				})
				.attr('height', d => {
					return height - y(d.averageObservationsPerDay)
				})
				.on('mouseover', function (d) {
					if (that.svgWrapper.classed('filtered') && !that.d3.select(this).classed('active')) return
					that.d3.select(this).classed('hovered', true)
					that.showTooltip(tooltip, d)
				})
				.on('mousemove', function (d) {
					if (that.svgWrapper.classed('filtered') && !that.d3.select(this).classed('active')) return
					that.showTooltip(tooltip, d)
				})
				.on('mouseout', function () {
					that.d3.select(this).classed('hovered', false)
					tooltip.classed('hidden', true)
				})
				.on('click', function (d) {
					const isAlreadyClicked = that.d3.select(this).classed('active')

					that.d3.select(`#${that.svgWrapperSelector} .bar.active`).classed('active', false)
					
					if (isAlreadyClicked) {
						that.setFilter(false)
						return
					}
					
					that.d3.select(`#${that.svgWrapperSelector} .bar.active`).classed('active', false)
					
					that.d3.select(this).classed('active', true)
					that.setFilter(true, d)
				})
			
			svg.append('g')
				.attr('class', 'axis axis-x')
				.attr('transform', `translate(0, ${height})`)
				.call(xAxis)
				.selectAll('text')
				.style('text-anchor', 'center')
        .attr('dx', '-45')
				.attr('dy', '2')
				.attr('transform', 'rotate(-75)')
				.attr('style', 'font-size: 0.7em')

			svg.select('.axis-x')
				.append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2 - 40)
        .attr('y', 85)
        .text(this.axisLabels.x)

			svg.append('g')
				.attr('class', 'axis axis-y')
				.call(yAxis)
				.append('text')
        .attr('class', 'axis-label')
				.attr('transform', 'rotate(-90)')
        .attr('x', -height + (height / 4))
        .attr('y', -40)
				.text(this.axisLabels.y)
				
			// draw line of mean number of observations
			const meanObservations = data.reduce((accum, item) => accum + item.averageObservationsPerDay, 0) / data.length
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
		onDataSetHandler (data) {
			this.d3.select(`#${this.svgWrapperSelector} svg`).remove()
			this.d3.select(`#${this.svgWrapperSelector} .tooltip`).remove()
			
			const weekGroupData = this.getWeekGroupData(data)
      if (!weekGroupData || !weekGroupData.length) return
      
			this.renderBarplot(weekGroupData)
		},
    getWeekGroupData (data) {
			if (!data || !data.length) return false

      const weekGroupData = []
			data.forEach(fd => {
        const week = fd.week
        const weekYear = `${week}/${fd.date.getFullYear()}`
				const weekGroup = weekGroupData.find(mgd => mgd.weekYear === weekYear)
				const dateString = `${fd.date.getDate()}-${fd.date.getMonth() + 1}-${fd.date.getFullYear()}`

				if (weekGroup) {
					if (!weekGroup.dates.includes(dateString)) {
						weekGroup.dates.push(dateString)
					}
					weekGroup.numOfObservations++
				} else {
					weekGroupData.push({
            week,
						weekYear,
						dates: [dateString],
						numOfObservations: 1,
						get averageObservationsPerDay () {
							return this.numOfObservations / this.dates.length
						}
					})
				}
      })
      
      return weekGroupData
    },
		showTooltip (tooltip, d) {
			tooltip
				.classed('hidden', false)
				.style('left', `${this.d3.event.offsetX - 40}px`)
				.style('top', `${this.d3.event.offsetY - 60}px`)
				.html(
					`<span>${d.weekYear}</span>` +
					`<span>${d.averageObservationsPerDay.toFixed(1)} observations/day</span>`
				)
		},
		setFilter (status, data = undefined) {
			this.isFiltered = status
			this.svgWrapper.classed('filtered', status)
			this.$store.commit('setFilterWeek', data && data.week)
		}
  },
  mounted () {
		this.setFilter(false)
		this.onDataSetHandler(this.filteredData)
  }
}
</script>

<style lang="scss">
@import "./../../scss/_colors";

.week-barplot {
	position: relative;

	.bar {
		fill: $cyan!important;
		shape-rendering: crispEdges;
		cursor: pointer;
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
	
	.filtered {
		.bar {
			&:not(.active) {
				opacity: .15;
			}
		}
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
