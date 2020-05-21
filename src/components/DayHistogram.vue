<template>
	<div>
		<h3 class="text-center">{{ title }}</h3>
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
				x: 'Day',
				y: 'Observations'
			},
			svgMargin: {
        top: 40,
        right: 30,
        bottom: 60,
        left: 65
			},
			svgHeight: 275
    }
  },
  computed: {
    d3 () {
      return this.$store.getters.d3
    },
    filteredData () {
      return this.$store.getters.filteredData
		},
		svgWrapper () {
			return this.d3.select(`#${this.svgWrapperSelector}`)
		},
		svgWrapperRect () {
			return this.svgWrapper.node().getBoundingClientRect()
		}
	},
	watch: {
		data (value) {
			this.onDataSetHandler(value)
		}
	},
  methods: {
    renderHistogram (data) {			
      const svgWrapperWidth = this.svgWrapperRect.width

      const width = svgWrapperWidth - this.svgMargin.left - this.svgMargin.right
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

      // Set x (timeseries) and y (linear) scales
      const xScale = this.d3.time.scale().range([0, width]);
      const yScale = this.d3.scale.linear().range([height, 0]);

      // Set the x and y scales to the data ranges x based on min and
			// max date range (this.d3.extent()) and y based on 0 to max value
			const maxObservations = this.d3.max(data, d => d.numOfObservations)
      xScale.domain(this.d3.extent(data, d => d.date))
			yScale.domain([0, maxObservations])

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
        .attr('y', d => yScale(d.numOfObservations))
        .attr('width', barWidth - 2)
				.attr('height', d => height - yScale(d.numOfObservations))
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

      // Add the axis 
      const xAxis = this.d3.svg.axis().scale(xScale).orient('bottom')
        .tickFormat(this.d3.time.format('%d %b %y'))
        .tickSize(5)

      svg.append('g')
        .attr('class', 'axis axis-x')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'center')
        .attr('dx', '0')
				.attr('dy', '15')

			this.d3.select('.axis-x')
				.append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', 55)
        .text(this.axisLabels.x);
      
      const yAxis = this.d3.svg.axis().scale(yScale).orient('left')
        .tickSize(5)

      svg.append('g')
        .attr('class', 'axis axis-y')
        .call(yAxis)
        .append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height + (height / 3))
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

      const dataPerDay = this.getDaysBetweenTwoDates(
        data[0].date,
        data[data.length - 1].date
      )
      if (!dataPerDay.length) return false

      return dataPerDay.map(d => {
        d.date = d
        const observationsByDate = data.filter(fd =>
          fd.date.getDate() === d.getDate()
          && fd.date.getMonth() === d.getMonth()
          && fd.date.getFullYear() === d.getFullYear()
        )
        d.numOfObservations = observationsByDate ? observationsByDate.length : 0

        return d
      })
		},
		onDataSetHandler (data) {
			this.d3.select('svg').remove()
			this.d3.select('.tooltip').remove()
			
			const dayGroupData = this.getDayGroupData(data)
			if (!dayGroupData || !dayGroupData.length) return
			
			this.renderHistogram(dayGroupData)
		},
		showTooltip (tooltip, d) {
			tooltip
				.classed('hidden', false)
				.style('left', `${this.d3.event.offsetX}px`)
				.style('top', `${this.d3.event.offsetY}px`)
				.html(
					`<span>${d.date.getDate()}-${d.date.getMonth() + 1}-${d.date.getFullYear()}</span>` +
					`<span>${d.numOfObservations} observations</span>`
				)
		}
  },
  mounted () {
		this.onDataSetHandler(this.data)
  }
}
</script>

<style lang="scss">
@import "./../scss/_colors";

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

.graph-title {
	font-size: 1.2em;
}

.axis-label {
  font-size: 1.1em;
}

.tick {
	font-size: .75em;
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

</style>
