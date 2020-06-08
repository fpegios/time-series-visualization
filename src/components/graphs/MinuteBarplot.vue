<template>
	<div :class="svgWrapperSelector">
		<h2 v-if="filter.hour !== undefined" class="text-center">{{ title }}</h2>
		<div :id="svgWrapperSelector"></div>
	</div>
</template>

<script>
export default {
  name: 'MinuteBarplot',
  props: [
		'data'
	],
  data () {
    return {
			svgWrapperSelector: 'minute-barplot',
			title: 'Observations per minute',
			axisLabels: {
				x: 'Minutes',
				y: 'Observations'
      },
			svgMargin: {
        top: 40,
        right: 60,
        bottom: 100,
        left: 60
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
      if (this.filter.hour === undefined) {
        this.d3.select(`#${this.svgWrapperSelector} svg`).remove()
        this.d3.select(`#${this.svgWrapperSelector} .tooltip`).remove()
        return
      }
			this.onDataSetHandler(this.filteredData)
		},
		filter () {
			if (this.filter.hour === undefined) {
        this.d3.select(`#${this.svgWrapperSelector} svg`).remove()
        this.d3.select(`#${this.svgWrapperSelector} .tooltip`).remove()
        return
			}
      this.onDataSetHandler(this.filteredData)
		}
	},
  methods: {
		getTwoDigitForm (number) {
			return ('0' + number).slice(-2)
		},
		onDataSetHandler (data) {
			this.d3.select(`#${this.svgWrapperSelector} svg`).remove()
			this.d3.select(`#${this.svgWrapperSelector} .tooltip`).remove()
      
			const minuteGroupData = this.getMinuteGroupData(data)
      if (!minuteGroupData || !minuteGroupData.length) return

			this.renderBarplot(minuteGroupData)
    },
    getMinuteGroupData (data) {
      const minuteGroupData = []
      for (let i = 0; i < 60; i++) {
        minuteGroupData.push({
          minute: i,
          numOfObservations: 0
        })
      }

      data.forEach(fd => {
        minuteGroupData[fd.date.getMinutes()].numOfObservations ++
      })

      return minuteGroupData
    },
    renderBarplot (data) {
			const that = this
      const width = this.svgWrapperRect.width - this.svgMargin.right
			const height = width / 5

			const tooltip = this.svgWrapper
				.append('div')
        .attr('class', 'tooltip hidden')

			const x = this.d3.scale.ordinal().rangeRoundBands([0, width], .05);
			const y = this.d3.scale.linear().range([height, 0])

			const xAxis = this.d3.svg.axis()
					.scale(x)
					.orient('bottom')
					.tickSize(5)

			const yAxis = this.d3.svg.axis()
					.scale(y)
					.orient('left')
					.tickFormat(this.d3.format('d')).tickSubdivide(0);

			const svg = this.svgWrapper
				.append('svg')
				.attr('width', width + this.svgMargin.left + this.svgMargin.right)
				.attr('height', height + this.svgMargin.top + this.svgMargin.bottom)
				.append('g')
				.attr('transform',  `translate(${this.svgMargin.left}, ${this.svgMargin.top})`)

			const maxObservations = this.d3.max(data, d => { return d.numOfObservations })
			x.domain(data.map(function(d) { return d.minute }))
			y.domain([0, maxObservations])

			svg.selectAll('bar')
				.data(data)
				.enter()
				.append('rect')
				.attr('class', 'bar')
				.attr('x', d => {
					return x(d.minute.toString())
				})
				.attr('width', x.rangeBand())
				.attr('y', d => {
					return y(d.numOfObservations)
				})
				.attr('height', d => {
					return height - y(d.numOfObservations)
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
			
			svg.append('g')
				.attr('class', 'axis axis-x')
				.attr('transform', `translate(0, ${height})`)
				.call(xAxis)
				.selectAll('text')
				.style('text-anchor', 'center')
        .attr('dx', '-3')
				.attr('dy', '10')
				.attr('style', 'font-size: 0.7em')

			svg.select('.axis-x')
				.append('text')
        .attr('class', 'axis-label')
				.style('text-anchor', 'center')
        .attr('x', width / 2 - 60)
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
		showTooltip (tooltip, d) {
			tooltip
				.classed('hidden', false)
				.style('left', `${this.d3.event.offsetX - 40}px`)
				.style('top', `${this.d3.event.offsetY - 60}px`)
				.html(
					`<span>Minute: ${this.getTwoDigitForm(d.minute)}</span>` +
					`<span>${d.numOfObservations} observations</span>`
				)
		},
  },
  mounted () {
  }
}
</script>

<style lang="scss">
@import "./../../scss/_colors";

.minute-barplot {
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
