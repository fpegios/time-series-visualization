<template>
  <v-container id="statistics" fluid class="px-12">
    <v-card max-width="100%">
			<v-card-title>Statistics</v-card-title>
      <v-card-text>
				<v-row class="mx-0" no-gutters>
					<v-col cols="12">
            <div id="day-histogram"></div>
					</v-col>
				</v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'Statistics',
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
    createBarChart () {
      const dayHistogramWrapperWidth = this.d3.select('#day-histogram').node().getBoundingClientRect().width

      const margin = {
        top: 20,
        right: 50,
        bottom: 70,
        left: 75
      }

      const width = dayHistogramWrapperWidth - margin.left - margin.right
      const height = 500 - margin.top - margin.bottom

      const svg = this.d3.select('#day-histogram')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      // Set x (timeseries) and y (linear) scales
      const xScale = this.d3.time.scale().range([0, width]);
      const yScale = this.d3.scale.linear().range([height, 0]);

      // Set the x and y scales to the data ranges x based on min and
      // max date range (this.d3.extent()) and y based on 0 to max value
      xScale.domain(this.d3.extent(this.data, d => d.date))
      yScale.domain([0, this.d3.max(this.data, d => d.numOfObservations) + 2])

      // Create bar and append data.close and x position set based on barWidth equidistant
      const barWidth = width / this.data.length

      const bar = svg.selectAll('g')
        .data(this.data)
        .enter()
        .append('g')
        .attr('transform', (d, i) => `translate(${i * barWidth}, 0)`)
        
      // Add rectangles to bar 
      bar.append('rect')
        .attr('class', 'bar')
        .attr('y', d => yScale(d.numOfObservations))
        .attr('width', barWidth - 2)
        .attr('height', d => height - yScale(d.numOfObservations))

      // Add text to rectangles
      bar.append('text')
        .attr('y', d => yScale(d.numOfObservations) - 5)
        .attr('text-anchor','middle')
        .attr('x', barWidth / 2)
        .text(d => d.numOfObservations)

      // Add the axis 
      const xAxis = this.d3.svg.axis().scale(xScale).orient('bottom')
        .tickFormat(this.d3.time.format('%d %b %y'))
        .ticks(4)
        .tickSize(0);

      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '0')
        .attr('dy', '30')
      
      this.d3.select('.x.axis')
        .append('text')
        .attr('x', width / 2)
        .attr('y', 60)
        .attr('font-size', '1.2em')
        .text('Day');

      const yAxis = this.d3.svg.axis().scale(yScale).orient('left')

      svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height + (height / 4))
        .attr('y', -65)
        .attr('dy', '1em')
        .attr('font-size', '1.2em')
        .text('Number of Observations');
    },
    getDaysBetweenTwoDates (start, end) {
      for (var arr=[], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
          arr.push(new Date(dt));
      }
      return arr
    },
    createDataPerDayArray () {
      const dataPerDay = this.getDaysBetweenTwoDates(
        this.filteredData[0].date,
        this.filteredData[this.filteredData.length - 1].date
      )
      if (!dataPerDay.length) return

      this.data = dataPerDay.map(d => {
        d.date = d
        const observationsByDate = this.filteredData.filter(fd =>
          fd.date.getDate() === d.getDate()
          && fd.date.getMonth() === d.getMonth()
          && fd.date.getFullYear() === d.getFullYear()
        )
        d.numOfObservations = observationsByDate ? observationsByDate.length : 0

        return d
      })
    }
  },
  mounted () {
    this.createDataPerDayArray()
    this.createBarChart()
  }
}
</script>

<style>

.bar {
  fill: #00bcd4!important;
  shape-rendering: crispEdges;
}

.axis path, .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}

</style>
