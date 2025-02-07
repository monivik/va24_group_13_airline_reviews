import * as d3 from 'd3'
import data from '../data/airDataFiltered.csv'
import './index.scss'

const description = `
`
/*
This bar chart shows average airline ratings across various categories.
  A tooltip provides additional details on ratings and comparisons.
  Data: Airline Reviews Dataset from airlinequality.com
  <br>
*/

export default class MyBarchart {
  constructor (id, name) {
    this.id = id
    this.name = name
    this.description = description

    this.selectedCategory = 'Overall_Rating' // Default categrory
    this.selectedSort = 'Alphabetically' // Default sorting order
  }

  _plotDescription (div) {
    // Title of the chart
    const title = div.append('h2')
      .html(this.name)
      .style('position', 'relative')
      .style('display', 'inline-block')

    // tooltip div (hidden by default)
    const tooltip = div.append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'lightgray')
      .style('padding', '5px')
      .style('border-radius', '5px')
      .style('box-shadow', '0px 0px 5px rgba(0, 0, 0, 0.2)')
      .style('display', 'none')
      .style('z-index', '1000') // appears above other elements
      .text('This chart shows the average airline ratings across various categories. Hover over bars for more details.')

    // Show tooltip on hover
    title.on('mouseover', (event) => {
      tooltip.style('display', 'block')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
    })
      .on('mousemove', (event) => {
        tooltip.style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
      })
      .on('mouseout', () => {
        tooltip.style('display', 'none')
      })
  }

  _plotChart (div) {
    console.log('Dataset: ', data)

    const margin = { top: 30, right: 30, bottom: 0, left: 30 }
    const width = div.node().getBoundingClientRect().width
    const height = 250

    const svg = div.append('svg')
      .attr('id', this.id)
      .attr('width', div.node().getBoundingClientRect().width)
      .attr('height', div.node().getBoundingClientRect().height)

    // mapping for category names
    const categoryMapping = {
      Overall_Rating: 'Overall Rating',
      'Seat Comfort': 'Seat Comfort',
      'Cabin Staff Service': 'Cabin Staff Service',
      'Food & Beverages': 'Food & Beverages',
      'Ground Service': 'Ground Service',
      'Inflight Entertainment': 'Inflight Entertainment',
      'Wifi & Connectivity': 'Wifi & Connectivity',
      'Value For Money': 'Value For Money'
    }

    // extract categories and sort
    const reviewCategories = Object.keys(categoryMapping).sort((a, b) =>
      a === 'Overall_Rating' ? -1 : b === 'Overall_Rating' ? 1 : categoryMapping[a].localeCompare(categoryMapping[b])
    )

    // add label for category dropdown
    d3.select('#titleDiv1')
      .append('label')
      .attr('for', 'categoryDropdown')
      .text('Select Category: ')
      .style('display', 'block')
      .style('display', 'block')
      .style('font-size', '12px')
      .style('margin-top', '4px')
      .style('margin-bottom', '2px')

    const dropdown = d3.select('#titleDiv1')
      .append('select')
      .attr('id', 'categoryDropdown')
      .on('change', (event) => {
        this.selectedCategory = event.target.value
        this.updateChart(svg, xScale, yScale, tooltip, margin, width, height)
      })

    dropdown.selectAll('option')
      .data(reviewCategories)
      .enter()
      .append('option')
      .text(d => categoryMapping[d])
      .attr('value', d => d)

    // Add label for sorting dropdown
    d3.select('#titleDiv1')
      .append('label')
      .attr('for', 'sortingDropdown')
      .text('Sort By: ')
      .style('display', 'block')
      .style('font-size', '12px')
      .style('margin-top', '4px')
      .style('margin-bottom', '2px')

    // Dropdown for sorting
    const sortingDropdown = d3.select('#titleDiv1')
      .append('select')
      .attr('id', 'sortingDropdown')
      .on('change', (event) => {
        this.selectedSort = event.target.value
        this.updateChart(svg, xScale, yScale, tooltip, margin, width, height)
      })

    sortingDropdown.selectAll('option')
      .data(['Alphabetically', 'Highest to Lowest Rating'])
      .enter()
      .append('option')
      .text(d => d)
      .attr('value', d => d)

    // unique values of airlines
    const uniqueAirlines = [...new Set(data.map(d => d['Airline Name']))]

    // Declare the x (horizontal position) scale.
    const xScale = d3.scaleBand()
      .domain(uniqueAirlines)
      .range([margin.left, width - margin.right])
      .padding(0.1)

    // Declare the y (vertical position) scale.
    const yScale = d3.scaleLinear()
      .domain([0, 10])
      .nice()
      .range([height - margin.bottom, margin.top])

    // Tooltip
    const tooltip = d3.select(div.node())
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'lightgray')
      .style('padding', '5px')
      .style('border-radius', '5px')

    // Add the x-axis and label with rotated labels
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0)
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-65)')
      .attr('text-anchor', 'end')
      .style('font-size', '12px')

    // Add the y-axis
    const yAxis = d3.axisLeft(yScale) // .tickFormat((y) => (y * 1).toFixed())
      .tickValues(d3.range(0, 11, 2)) // Generates [0, 2, 4, 6, 8, 10]
      .tickFormat(d3.format('d')) // Ensures whole numbers are displayed
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .style('font-size', '12px')

    // add y axis label
    svg.append('g').append('text')
      .attr('x', 10)
      .attr('y', 10)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'start')
      // .text('Average Rating')
      // .attr('font-size', 12)
      .style('font-size', '12px')

    d3.select('#categoryDropdown')
      .style('font-size', '12px')

    d3.select('#sortingDropdown')
      .style('font-size', '12px')

    dropdown.selectAll('option')
      .style('font-size', '12px')

    sortingDropdown.selectAll('option')
      .style('font-size', '12px')

    this.updateChart(svg, xScale, yScale, tooltip, margin, width, height)
  }

  updateChart (svg, xScale, yScale, tooltip, margin, width, height) {
    // calculate aggregated data bsed on selected category
    const aggregatedData = [...new Set(data.map(d => d['Airline Name']))].map(airline => {
      const airlineData = data.filter(d => d['Airline Name'] === airline)
      const avgRating = d3.mean(airlineData, d => +d[this.selectedCategory]) || 0
      const count = airlineData.filter(d => d[this.selectedCategory] !== '').length // count ratings
      return { airline, avgRating, count }
    })

    // sort data based on selection
    if (this.selectedSort === 'Alphabetically') {
      aggregatedData.sort((a, b) => a.airline.localeCompare(b.airline))
    } else if (this.selectedSort === 'Highest to Lowest Rating') {
      aggregatedData.sort((a, b) => b.avgRating - a.avgRating)
    }

    // update the xScale domain after sorting
    xScale.domain(aggregatedData.map(d => d.airline))

    // redraw x-axis
    svg.selectAll('.x-axis').remove()
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0)
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-65)')
      .attr('text-anchor', 'end')
      .style('font-size', '12px')

    // data binding for bars
    const bars = svg.selectAll('.bar')
      .data(aggregatedData, d => d.airline)

    // update current bars
    bars.transition()
      .duration(500)
      .attr('x', d => xScale(d.airline)) // update the x position of the bars
      .attr('y', d => yScale(d.avgRating))
      .attr('height', d => yScale(0) - yScale(d.avgRating))

    // add new bars
    bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.airline))
      .attr('y', yScale(0))
      .attr('height', 0)
      .attr('width', xScale.bandwidth())
      .on('click', (event, d) => {
        if (this.onAirlineSelect) {
          this.onAirlineSelect(d.airline) // update the line chart
        }

        // update the dropdown selection
        d3.select('#airlineDropdown').property('value', d.airline)

        // toggle bar color
        const bar = d3.select(event.currentTarget)
        const isSelected = bar.classed('selected')

        d3.selectAll('.bar').classed('selected', false).style('fill', '#3a7ca5') // reset all bars
        if (!isSelected) {
          bar.classed('selected', true).style('fill', '#002366') // highlight clicked bar
        } else {
          bar.classed('selected', false).style('fill', '#3a7ca5') // revert color if clicked again
          d3.select('#airlineDropdown').property('value', 'All') // reset dropdown to default
          if (this.onAirlineSelect) {
            this.onAirlineSelect('All')
          }
        }
      })
      .transition()
      .duration(500)
      .attr('y', d => yScale(d.avgRating))
      .attr('height', d => yScale(0) - yScale(d.avgRating))

    // compute the overall average rating across all airlines
    const overallAverage = d3.mean(aggregatedData, d => d.avgRating) || 0

    // show tooltip with rating and count
    bars.on('mouseover', function (event, d) {
      d3.select(this).style('opacity', 0.7) // highlight bar

      const deviation = (d.avgRating - overallAverage).toFixed(2)
      const deviationText = deviation >= 0 ? `+${deviation}` : deviation

      tooltip.transition()
        .duration(200)
        .style('opacity', 0.9)
      tooltip.html(`Average rating: ${d.avgRating.toFixed(1)}<br>Submitted ratings: ${d.count}<br>Deviation across all airlines: ${deviationText}`)
        .style('left', `${event.pageX + 5}px`)
        .style('top', `${event.pageY - 28}px`)
    })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 1) // reset bar opacity

        tooltip.transition()
          .duration(500)
          .style('opacity', 0)
      })

    bars.exit().remove()
  }

  setOnAirlineSelect (callback) {
    this.onAirlineSelect = callback
  }

  highlightBar (selectedAirline) {
    const bars = d3.select(`#${this.id}`).selectAll('.bar')
    bars.each(function (d) {
      if (d.airline === selectedAirline) {
        d3.select(this).style('fill', '#002366')
      } else {
        d3.select(this).style('fill', '#3a7ca5')
      }
    })
  }

  plot () {
    if (this._plotChart === undefined) {
      throw new Error('_plotChart method must be implemented')
    }

    d3.select('#titleDiv1').selectAll('*').remove()
    d3.select('#chartDiv1').selectAll('*').remove()

    this._plotDescription(d3.select('#titleDiv1'))
    this._plotChart(d3.select('#chartDiv1'))
  }
}
