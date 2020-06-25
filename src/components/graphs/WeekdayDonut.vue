<template>
	<div :class="svgWrapperSelector">
		<h2 class="text-center mb-2">{{ title }}</h2>
		<div :id="svgWrapperSelector"></div>
	</div>
</template>

<script>
export default {
  name: 'WeekdayDonut',
  props: [
		'data'
	],
  data () {
    return {
			svgWrapperSelector: 'weekday-donut',
			title: 'Day average observations per weekday',
			svgMargin: {
        top: 50,
        right: 10,
        bottom: 40,
        left: 10
			},
			isFiltered: false,
			weekdayNames: [
				'Sunday',
				'Monday',
				'Tuesday',
				'Wednesday',
				'Thursday',
				'Friday',
				'Saturday'
			],
			colorPalette: [
				'#869c02',
				'#716666',
				'#e0648a',
				'#17aac4',
				'#491d1d',
				'#0156aa',
				'#15a15c',
			]
    }
  },
  computed: {
    d3 () {
      return this.$store.getters.d3
    },
    filteredData () {
      return this.data.filter(v => {
				if (
					this.filter.date !== undefined
					&& (
						this.filter.date.getMonth() !== v.date.getMonth()
						|| this.filter.date.getDate() !== v.date.getDate()
						|| this.filter.date.getFullYear() !== v.date.getFullYear()
					)
				) return false
				if (this.filter.month !== undefined && this.filter.month !== v.date.getMonth()) return false
				if (this.filter.week !== undefined && this.filter.week !== v.week) return false
				if (this.filter.weekday !== undefined && this.filter.weekday !== v.date.getDay()) return false
				if (this.filter.hour !== undefined && this.filter.hour !== v.date.getHours()) return false
				
				return true
			})
		},
    filter () {
      return {
				date: this.$store.getters.filterDate,
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
    getWeekdayGroupData (data) {
			if (!data || !data.length) return false

			const weekdayGroupData = []
			this.filteredData.forEach(fd => {
				const weekdayGroup = weekdayGroupData.find(mgd => mgd.day === fd.date.getDay())
				const dateString = `${fd.date.getDate()}-${fd.date.getMonth() + 1}-${fd.date.getFullYear()}`

				if (weekdayGroup) {
					if (!weekdayGroup.dates.includes(dateString)) {
						weekdayGroup.dates.push(dateString)
					}
					weekdayGroup.numOfObservations++
				} else {
					weekdayGroupData.push({
						day: fd.date.getDay(),
						weekdayName: this.weekdayNames[fd.date.getDay()],
						dates: [dateString],
						numOfObservations: 1,
						get averageObservationsPerDay () {
							return this.numOfObservations / this.dates.length
						}
					})
				}
			})

			return weekdayGroupData.sort((a, b) => a.day - b.day )
		},
		onDataSetHandler (data) {
			this.d3.select(`#${this.svgWrapperSelector} svg`).remove()
			this.d3.select(`#${this.svgWrapperSelector} .tooltip`).remove()
			
			const weekdayGroupData = this.getWeekdayGroupData(data)
			if (!weekdayGroupData || !weekdayGroupData.length) return

			this.renderDonut(weekdayGroupData)
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

			const key = d => { return d.data.weekdayName }

			const color = this.d3.scale.ordinal()
				.domain(this.weekdayNames)
				.range(this.colorPalette)

			/* ------- PIE SLICES -------*/
			var slice = svg
				.select('.slices')
				.selectAll('path.slice')
				.data(pie(data), key)

			slice.enter()
				.insert('path')
				.style('fill', d => { return color(d.data.weekdayName) })
				.attr('class', 'slice')
				.on('mouseover', function (d) {
					this.parentNode.appendChild(this)
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
					that.d3.select(`#${that.svgWrapperSelector} .label.${d.data.weekdayName}`).classed('active', true)
					that.d3.select(`#${that.svgWrapperSelector} .line.${d.data.weekdayName}`).classed('active', true)
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
					return `label ${d.data.weekdayName}`
				})
				.attr('dy', '.35em')
				.text(d => {
					return d.data.weekdayName
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
					return `line ${d.data.weekdayName}`
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
		midAngle(d){
			return d.startAngle + (d.endAngle - d.startAngle) / 2
		},
		showTooltip (tooltip, d) {
			tooltip
				.classed('hidden', false)
				.style('left', `${this.d3.event.offsetX - 40}px`)
				.style('top', `${this.d3.event.offsetY - 40}px`)
				.html(
					`<span>${d.data.weekdayName}</span>` +
					`<span>${d.data.averageObservationsPerDay.toFixed(1)} observations/day</span>`
				)
		},
		setFilter (status, data = undefined) {
			this.isFiltered = status
			this.svgWrapper.classed('filtered', status)
			this.$store.commit('setFilterWeekday', data && data.day)
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

.weekday-donut {
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
		&.active {
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
