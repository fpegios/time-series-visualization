<template>
	<div :class="svgWrapperSelector">
		<h2 class="text-center mb-2">{{ title }}</h2>
		<div :id="svgWrapperSelector"></div>
	</div>
</template>

<script>
export default {
  name: 'MonthDonut',
  props: [
		'data'
	],
  data () {
    return {
			svgWrapperSelector: 'month-donut',
			title: 'Day average observations per month',
			svgMargin: {
        top: 20,
        right: 10,
        bottom: 40,
        left: 10
			},
			isFiltered: false,
			monthNames: [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December'
			],
			colorPalette: [
				'#869c02',
				'#716666',
				'#e0648a',
				'#17aac4',
				'#491d1d',
				'#28ABC5',
				'#BB486B',
				'#61E050',
				'#c4be58',
				'#a7F274',
				'#d81031',
				'#1d7c0e',
			]
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
			this.setFilter(false)
			this.onDataSetHandler(this.filteredData)
		},
		filter (newValue, oldValue) {
			if (oldValue && !this.isFiltered) this.onDataSetHandler(this.filteredData)
		}
	},
  methods: {
		onDataSetHandler (data) {
			this.d3.select(`#${this.svgWrapperSelector} svg`).remove()
			this.d3.select(`#${this.svgWrapperSelector} .tooltip`).remove()
			
			const monthGroupData = this.getMonthGroupData(data)
			if (!monthGroupData || !monthGroupData.length) return

			this.renderDonut(monthGroupData)
		},
		getMonthGroupData (data) {
			if (!data || !data.length) return false

			const monthGroupData = []
			data.forEach(fd => {
				const monthGroup = monthGroupData.find(mgd => mgd.month === fd.date.getMonth())

				if (monthGroup) {
					if (!monthGroup.dates.includes(fd.date.getDate())) {
						monthGroup.dates.push(fd.date.getDate())
					}
					monthGroup.numOfObservations++
				} else {
					monthGroupData.push({
						month: fd.date.getMonth(),
						monthName: this.monthNames[fd.date.getMonth()],
						dates: [fd.date.getDate()],
						numOfObservations: 1,
						get averageObservationsPerDay () {
							return this.numOfObservations / this.dates.length
						}
					})
				}
			})

			return monthGroupData.sort((a, b) => a.month - b.month )
		},
		renderDonut (data) {
			const that = this
			const width = this.svgWrapperRect.width
			const height = width / 2
			const radius = Math.min(width, height) / 2

			const tooltip = this.svgWrapper
				.append('div')
        .attr('class', 'tooltip hidden')

			const svg = this.svgWrapper
				.append('svg')
        .attr('width', width + this.svgMargin.left + this.svgMargin.right)
        .attr('height', height + this.svgMargin.top + this.svgMargin.bottom)
				.append('g')

			svg.append('g').attr('class', 'slices')
			svg.append('g').attr('class', 'labels')
			svg.append('g').attr('class', 'lines')

			const pie = this.d3.layout.pie()
				.sort(null)
				.value(d => {
					return d.averageObservationsPerDay
				})

			const arc = this.d3.svg.arc()
				.outerRadius(radius * 0.8)
				.innerRadius(radius * 0.4)

			const outerArc = this.d3.svg.arc()
				.innerRadius(radius * 0.9)
				.outerRadius(radius * 0.9)

			svg.attr('transform',  `translate(${width / 2 + this.svgMargin.left}, ${height / 2 + this.svgMargin.top})`)

			const key = d => { return d.data.monthName }

			const color = this.d3.scale.ordinal()
				.domain(this.monthNames)
				.range(this.colorPalette)

			/* ------- PIE SLICES -------*/
			var slice = svg
				.select('.slices')
				.selectAll('path.slice')
				.data(pie(data), key)

			slice.enter()
				.insert('path')
				.style('fill', d => { return color(d.data.monthName) })
				.attr('class', 'slice')
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

					that.d3.select(`#${that.svgWrapperSelector} .slice.active`).classed('active', false)
					that.d3.select(`#${that.svgWrapperSelector} .label.active`).classed('active', false)
					that.d3.select(`#${that.svgWrapperSelector} .line.active`).classed('active', false)
					
					if (isAlreadyClicked) {
						that.setFilter(false)
						return
					}
					
					that.d3.select(`#${that.svgWrapperSelector} .slice.active`).classed('active', false)
					that.d3.select(`#${that.svgWrapperSelector} .label.active`).classed('active', false)
					that.d3.select(`#${that.svgWrapperSelector} .line.active`).classed('active', false)
					
					that.d3.select(this).classed('active', true)
					that.d3.select(`#${that.svgWrapperSelector} .label.${d.data.monthName}`).classed('active', true)
					that.d3.select(`#${that.svgWrapperSelector} .line.${d.data.monthName}`).classed('active', true)
					that.setFilter(true, d.data)
				})

			slice		
				.transition().duration(1000)
				.attrTween('d', function (d) {
					this._current = this._current || d
					var interpolate = that.d3.interpolate(this._current, d)
					this._current = interpolate(0)
					return t => {
						return arc(interpolate(t))
					}
				})

			slice.exit().remove()

			/* ------- TEXT LABELS -------*/
			var text = svg
				.select('.labels')
				.selectAll('text')
				.data(pie(data), key)

			text.enter()
				.append('text')
				.attr('class', d => {
					return `label ${d.data.monthName}`
				})
				.attr('dy', '.35em')
				.text(d => {
					return d.data.monthName
				})

			text.transition().duration(1000)
				.attrTween('transform', function (d) {
					this._current = this._current || d;
					var interpolate = that.d3.interpolate(this._current, d);
					this._current = interpolate(0);
					return t => {
						var d2 = interpolate(t);
						var pos = outerArc.centroid(d2);
						pos[0] = radius * (that.midAngle(d2) < Math.PI ? 1 : -1)
						return 'translate('+ pos +')'
					};
				})
				.styleTween('text-anchor', function (d) {
					this._current = this._current || d
					var interpolate = that.d3.interpolate(this._current, d)
					this._current = interpolate(0)
					return t => {
						var d2 = interpolate(t)
						return that.midAngle(d2) < Math.PI ? 'start' : 'end'
					}
				})

			text.exit().remove()

			/* ------- SLICE TO TEXT POLYLINES -------*/
			var polyline = svg
				.select('.lines')
				.selectAll('polyline')
				.data(pie(data), key)
			
			polyline.enter()
				.append('polyline')
				.attr('class', d => {
					return `line ${d.data.monthName}`
				})


			polyline.transition().duration(1000)
				.attrTween('points', function (d) {
					this._current = this._current || d
					var interpolate = that.d3.interpolate(this._current, d)
					this._current = interpolate(0)
					return t => {
						var d2 = interpolate(t)
						var pos = outerArc.centroid(d2)
						pos[0] = radius * 0.95 * (that.midAngle(d2) < Math.PI ? 1 : -1)
						return [arc.centroid(d2), outerArc.centroid(d2), pos]
					}
				})
			
			polyline.exit().remove()
		},
		midAngle(d) {
			return d.startAngle + (d.endAngle - d.startAngle) / 2
		},
		showTooltip (tooltip, d) {
			tooltip
				.classed('hidden', false)
				.style('left', `${this.d3.event.offsetX - 40}px`)
				.style('top', `${this.d3.event.offsetY - 40}px`)
				.html(
					`<span>${d.data.monthName}</span>` +
					`<span>${d.data.averageObservationsPerDay.toFixed(1)} observations/day</span>`
				)
		},
		setFilter (status, data = undefined) {
			this.isFiltered = status
			this.svgWrapper.classed('filtered', status)
			this.$store.commit('setFilterMonth', data && data.month)
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

.month-donut {
	position: relative;

	.labels {
		pointer-events: none;
	}

	.slice {
		stroke-width: 2px;
		cursor: pointer;
		&.hovered {
			stroke: black;
		}
	}

	polyline {
		opacity: .3;
		stroke: black;
		stroke-width: 2px;
		fill: none;
		pointer-events: none;
	}

	.filtered {
		.slice,
		.label,
		.line {
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
