import * as d3 from 'd3'
import data from '../data/airDataFiltered.csv'
import './index.scss'

const description = `
  
`
/*
This line chart displays the average airline rating per year.
  Users can filter by airline to see trends over time.
  Data: Airline Reviews Dataset from airlinequality.com
*/

export default class MyLinechart {
  constructor (id, name) {
    this.id = id
    this.name = name
    this.description = description
    this.selectedAirline = 'All' // default, all airlines together (average)
  }

  _plotDescription (div) {
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
      .style('box-shadow', '0px 0px 5px rgba(0, 0, 0, 0.2)') // adds some shadow
      .style('display', 'none')
      .style('z-index', '1000') // appears above other elements
      .text('This chart shows the average airline rating per year. Hover over line for more details.')

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

    data.forEach(d => {
      d['Date Flown'] = new Date(d['Date Flown'])
    })

    // unique values of airlines
    const uniqueAirlines = ['All', ...new Set(data.map(d => d['Airline Name']))]

    const margin = { top: 30, right: 30, bottom: 0, left: 30 }
    const width = div.node().getBoundingClientRect().width // 350
    const height = 250

    const svg = div.append('svg')
      .attr('id', this.id)
      .attr('width', div.node().getBoundingClientRect().width)
      .attr('height', div.node().getBoundingClientRect().height)

    // add label for category dropdown
    d3.select('#titleDiv2')
      .append('label')
      .attr('for', 'airlineDropdown')
      .text('Select Airline: ')
      .style('display', 'block')
      .style('font-size', '12px')
      .style('margin-top', '4px')
      .style('margin-bottom', '2px')

    const dropdown = d3.select('#titleDiv2')
      .append('select')
      .attr('id', 'airlineDropdown')
      .on('change', (event) => {
        this.selectedAirline = event.target.value
        this.updateChart(svg, width, height, margin)
      })

    dropdown.selectAll('option')
      .data(uniqueAirlines)
      .enter()
      .append('option')
      .text(d => d)
      .attr('value', d => d)

    d3.select('#airlineDropdown')
      .style('font-size', '12px')

    dropdown.selectAll('option')
      .style('font-size', '12px')

    this.updateChart(svg, width, height, margin)
  }

  aggregateData () {
    const filteredData = this.selectedAirline === 'All'
      ? data
      : data.filter(d => d['Airline Name'] === this.selectedAirline)

    // calculate the average rating per year
    const ratingsByYear = d3.rollup(
      filteredData,
      v => ({
        avgRating: d3.mean(v, d => +d.Overall_Rating),
        count: v.length
      }),
      d => d['Date Flown'].getFullYear() // group by year
    )

    return Array.from(ratingsByYear, ([year, { avgRating, count }]) => ({
      year,
      avgRating,
      count
    })).sort((a, b) => a.year - b.year) // sort years in ascending order
  }

  setOnAirlineSelect (callback) {
    this.onAirlineSelect = callback
  }

  getChartWidth () {
    const div = d3.select(`#${this.id}`)
    const width = div.node().getBoundingClientRect().width
    console.log('Chart width:', width)
    return width
  }

  updateSelectedAirline (airline) {
    this.selectedAirline = airline || 'All'
    this.updateChart(d3.select(`#${this.id}`), this.getChartWidth(), 250, { top: 30, right: 30, bottom: 0, left: 30 })
  }

  updateChart (svg, width, height, margin) {
    const aggregatedData = this.aggregateData()

    const xScale = d3.scaleLinear()
      .domain([2015, 2023])
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleLinear()
      .domain([0, 10])
      .range([height - margin.bottom, margin.top])

    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.avgRating))

    svg.selectAll('*').remove()

    // Add the x-axis.
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'))
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-65)')
      .attr('text-anchor', 'end')
      .style('font-size', '12px')

    const yAxis = d3.axisLeft(yScale).ticks(height / 40)
    const gAxisY = svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .style('font-size', '12px')

    // add y axis label
    gAxisY.append('text')
      .attr('x', -margin.left + 10)
      .attr('y', 10)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'start')
      // .text('Average Rating')
      .style('font-size', '12px')

    // append path for the line
    svg.append('path')
      .datum(aggregatedData)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line)

    // tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'lightgray')
      .style('padding', '5px')
      .style('border-radius', '5px')
      .style('display', 'none')

    // circles for hover interaction
    svg.selectAll('circle')
      .data(aggregatedData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.avgRating))
      .attr('r', 5)
      .attr('fill', '#002366')
      .on('mouseover', (event, d) => {
        tooltip
          .style('display', 'block')
          .html(`Year: ${d.year}<br>Rating: ${d.avgRating.toFixed(2)}<br>Reviews: ${d.count}`)
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
      })
      .on('mouseout', () => {
        tooltip.style('display', 'none')
      })

    // call the callback when the airline is changed
    if (this.onAirlineSelect) {
      this.onAirlineSelect(this.selectedAirline) // pass the selected airline to the bar chart
    }
  }

  updateDropdown (selectedAirline) {
    this.selectedAirline = selectedAirline
    d3.select('#airlineDropdown').property('value', selectedAirline)
    this.updateChart(d3.select(`#${this.id}`).select('svg'), this.getChartWidth(), 250, { top: 30, right: 30, bottom: 0, left: 30 })
  }

  plot () {
    if (this._plotChart === undefined) {
      throw new Error('_plotChart method must be implemented')
    }

    d3.select('#titleDiv2').selectAll('*').remove()
    d3.select('#chartDiv2').selectAll('*').remove()

    this._plotDescription(d3.select('#titleDiv2'))
    this._plotChart(d3.select('#chartDiv2'))
  }
}
