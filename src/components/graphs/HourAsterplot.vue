<template>
	<div :class="svgWrapperSelector">
		<h2 class="text-center mb-2">{{ title }}</h2>
		<div :id="svgWrapperSelector" class="d-flex justify-center align-center">
			<div class="d-flex flex-column justify-center align-center position-absolute">
				<v-switch class="mx-0 my-0" :messages="timePeriod.toUpperCase()" @change='toggleTimePeriod'></v-switch>
			</div>
		</div>
	</div>
</template>

<script>
export default {
  name: 'HourAsterplot',
  props: [
		'data'
	],
  data () {
    return {
			svgWrapperSelector: 'hour-asterplot',
			title: 'Day average observations per hour',
			svgMargin: {
        top: 50,
        right: 20,
        bottom: 50,
        left: 20
			},
			isFiltered: false,
			colorPalette: [
        '#E1514B',
        '#F47245',
        '#FB9F59',
        '#FEC574',
        '#FAE38C',
        '#EAF195',
        '#C7E89E',
        '#9CD6A4',
        '#6CC4A4',
        '#4D9DB4',
        '#4776B4',
        '#5E4EA1',
			],
			timePeriod: 'am'
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
		toggleTimePeriod () {
			this.timePeriod = this.timePeriod === 'am' ? 'pm' : 'am'
			this.d3.select(`#${this.svgWrapperSelector} svg`).remove()
			this.renderAsterplot()
		},
		getTwoDigitForm (number) {
			return ('0' + number).slice(-2)
		},
		getHouRange (hourFrom) {
			let hourTo = hourFrom + 1
			if (this.timePeriod === 'am' && hourFrom === 11) {
				hourTo = 12
			}
			if (this.timePeriod === 'pm' && hourFrom === 23) {
				hourTo = 0
			}
			return `${this.getTwoDigitForm(hourFrom)}-${this.getTwoDigitForm(hourTo)}`
		},
    getHourGroupData (data) {
			if (!data || !data.length) return false

      let maxAverageObservationsPerHour = {
				am: 0,
				pm: 0
			}
			const hourGroupData = []

			for (let i = 0; i < 24; i++) {
				hourGroupData.push({
					hour: i,
					dates: [],
					numOfObservations: 0,
					get averageObservationsPerHour () {
						return this.numOfObservations || this.dates.length
							? this.numOfObservations / this.dates.length
							: 0
					}
				})
			}
			this.filteredData.forEach(fd => {
				const hour = fd.date.getHours()
				const hourGroup = hourGroupData.find(mgd => mgd.hour === hour)
				const dateString = `${fd.date.getDate()}-${fd.date.getMonth() + 1}-${fd.date.getFullYear()}`

				if (!hourGroup.dates.includes(dateString)) {
					hourGroup.dates.push(dateString)
				}
				hourGroup.numOfObservations++
      })
      
      hourGroupData.slice(0, 12).forEach(fd => {
        maxAverageObservationsPerHour.am = fd.averageObservationsPerHour > maxAverageObservationsPerHour.am
          ? fd.averageObservationsPerHour
          : maxAverageObservationsPerHour.am
			})
			hourGroupData.slice(2).forEach(fd => {
        maxAverageObservationsPerHour.pm = fd.averageObservationsPerHour > maxAverageObservationsPerHour.pm
          ? fd.averageObservationsPerHour
          : maxAverageObservationsPerHour.pm
      })

			return {
        hourGroupData: hourGroupData.sort((a, b) => a.hour - b.hour ),
        maxAverageObservationsPerHour
      }
		},
		onDataSetHandler (data) {
			this.filter(false)
			this.d3.select(`#${this.svgWrapperSelector} svg`).remove()
			this.d3.select(`#${this.svgWrapperSelector} .tooltip`).remove()
			
			const { hourGroupData, maxAverageObservationsPerHour } = this.getHourGroupData(data)
      if (!hourGroupData || !hourGroupData.length) return

			this.hourGroupData = hourGroupData
			this.maxAverageObservationsPerHour = maxAverageObservationsPerHour
			this.renderAsterplot()
		},
		renderAsterplot () {
			const that = this
			const data = this.timePeriod === 'am' ? this.hourGroupData.slice(0, 12) : this.hourGroupData.slice(12)
			const max = this.maxAverageObservationsPerHour[this.timePeriod]
			const width = this.svgWrapperRect.width - this.svgMargin.left - this.svgMargin.right
      const height = width / 2
      const radius = Math.min(width, height) / 2
      const innerRadius = 0.3 * radius

			const tooltip = this.svgWrapper
				.append('div')
        .attr('class', 'tooltip hidden')

      const pie = this.d3.layout.pie()
        .sort(null)
        .value( () => { return 1 })

      const arc = this.d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(d => { 
          return (radius - innerRadius) * ((d.data.averageObservationsPerHour / max)) + innerRadius 
        })

      const outlineArc = this.d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius);

      const svg = this.svgWrapper.append('svg')
				.attr('width', width + this.svgMargin.left + this.svgMargin.right)
				.attr('height', height + this.svgMargin.top + this.svgMargin.bottom)
        .append('g')
        .attr('transform',  `translate(${width / 2 + this.svgMargin.left}, ${height / 2 + this.svgMargin.top})`)
        
      svg.selectAll('.hour-arc')
        .data(pie(data))
				.enter()
				.append('path')
				.attr('class', d => {
					return `hour-arc hour-${d.data.hour}`
				})
        .attr('id', (d,i) => {
          return `hour-arc${i}`; 
        })
        .attr('d', outlineArc)

			svg.selectAll('.hour-part')
        .data(pie(data))
        .enter()
        .append('path')
        .attr('class', 'hour-part')
        .attr('d', arc)
        .attr('fill', (d, i) => {
					return this.colorPalette[i]
				})
        .attr('stroke', (d, i) => {
					return this.colorPalette[i]
				})
				.on('mouseover', function (d) {
					this.parentNode.appendChild(this);
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

					that.d3.select(`#${that.svgWrapperSelector} .hour-part.active`).classed('active', false)
					that.d3.select(`#${that.svgWrapperSelector} .label.active`).classed('active', false)
					that.d3.select(`#${that.svgWrapperSelector} .hour-arc.active`).classed('active', false)
					
					if (isAlreadyClicked) {
						that.filter(false)
						return
					}
					
					that.d3.select(`#${that.svgWrapperSelector} .hour-part.active`).classed('active', false)
					that.d3.select(`#${that.svgWrapperSelector} .label.active`).classed('active', false)
					that.d3.select(`#${that.svgWrapperSelector} .hour-arc.active`).classed('active', false)
					
					that.d3.select(this).classed('active', true)
					that.d3.select(`#${that.svgWrapperSelector} .label.hour-${d.data.hour}`).classed('active', true)
					that.d3.select(`#${that.svgWrapperSelector} .hour-arc.hour-${d.data.hour}`).classed('active', true)
					that.filter(true)
				})
			
			svg.selectAll('.label')
        .data(pie(data))
				.enter()
				.append('text')
				.attr('class', d => {
					return `label hour-${d.data.hour}`
				})
        .attr('x', 0)   //Move the text from the start angle of the arc
        .attr('dx', -5)   //Move the text from the start angle of the arc
        .attr('dy', -15) //Move the text down
        .attr('font-size', 18) //Move the text down
        .append('textPath')
        .attr('xlink:href', (d, i) => {
					return `#hour-arc${i}`
				})
        .text((d, i) => {
					return i
				})
		},
		showTooltip (tooltip, d) {
			tooltip
				.classed('hidden', false)
				.style('left', `${this.d3.event.offsetX - 50}px`)
				.style('top', `${this.d3.event.offsetY - 40}px`)
				.html(
					`<span>${this.getHouRange(d.data.hour)}</span>` +
					`<span>${d.data.averageObservationsPerHour.toFixed(1)} observations/day</span>`
				)
		},
		filter (status) {
			this.isFiltered = status
			this.svgWrapper.classed('filtered', status)
		}
  },
  mounted () {
		this.onDataSetHandler(this.data)
  }
}
</script>

<style lang="scss">
@import "./../../scss/_colors";

.hour-asterplot {
	position: relative;

	.v-messages__message,
	.v-input--switch__track,
	.v-input--switch__thumb {
		color: #1976d2 !important;
    caret-color: #1976d2 !important;
	}

	.v-input__control {
			align-items: center;

			.v-input--selection-controls__input {
				margin: 0!important;
			}
	}

	.labels {
		pointer-events: none;
	}	

	.hour-part {
		cursor: pointer;
		&.hovered {
			stroke-width: 2px;
			stroke: black;
		}
	}

	.hour-arc {
		fill: none;
		stroke-width: 1px;
		stroke: grey;
	}

	.filtered {
		.hour-part,
		.label,
		.hour-arc {
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
