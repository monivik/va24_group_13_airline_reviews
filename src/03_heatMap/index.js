import { PCA } from 'ml-pca'
import * as d3 from 'd3'
import data from '../data/airDataFiltered.csv'
import './index.scss'

const description = ''

// This heatmap shows the distribution of airline ratings. With colors indicating the number of reviews. Data: Airline Reviews Dataset from airlinequality.com

export default class MyHeatmap {
  constructor (id, name) {
    this.id = id
    this.name = name
    this.description = description
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
      .style('box-shadow', '0px 0px 5px rgba(0, 0, 0, 0.2)')
      .style('display', 'none')
      .style('z-index', '1000') // above other elements
      .text('This heatmap shows the distribution of airline ratings. With colors indicating the number of reviews.')

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
    console.log('Dataset:', data)

    // convert and preprocess data
    data.forEach(d => {
      d['Date Flown'] = new Date(d['Date Flown'])
      d.Overall_Rating = +d.Overall_Rating
      d['Seat Comfort'] = +d['Seat Comfort']
      d['Cabin Staff Service'] = +d['Cabin Staff Service']
      d['Food & Beverages'] = +d['Food & Beverages']
      d['Ground Service'] = +d['Ground Service']
      d['Inflight Entertainment'] = +d['Inflight Entertainment']
      d['Wifi & Connectivity'] = +d['Wifi & Connectivity']
      d['Value For Money'] = +d['Value For Money']
    })

    // extract numerical review attributes for PCA
    const reviewAttributes = ['Seat Comfort', 'Cabin Staff Service', 'Food & Beverages', 'Ground Service', 'Inflight Entertainment', 'Wifi & Connectivity', 'Value For Money']

    // filter out rows where any review attribute is missing
    const filteredData = data.filter(d =>
      reviewAttributes.every(attr => !isNaN(+d[attr])) // keep only rows with complete data
    )

    // construct review matrix only from complete rows
    const reviewMatrix = filteredData.map(d =>
      reviewAttributes.map(attr => +d[attr])
    )

    // perform PCA
    const pca = new PCA(reviewMatrix)
    const pca1 = pca.U.data.map(row => row[0]) // first principal component

    // assign PCA1 scores only to filtered data
    filteredData.forEach((d, i) => {
      d.pca1 = pca1[i]
    })

    // group data by (Airline, Rating) and count reviews
    const aggregatedData = d3.rollups(
      filteredData, // use filtered data
      v => v.length, // count number of reviews
      d => d['Airline Name'],
      d => d.Overall_Rating
    )

    // flatten data for visualization
    const heatmapData = aggregatedData.flatMap(([airline, ratingGroups]) =>
      ratingGroups.map(([rating, count]) => ({
        airline,
        rating,
        count
      }))
    )

    // dimensions
    const margin = { top: 30, right: 60, bottom: 150, left: 60 }
    const width = div.node().getBoundingClientRect().width - margin.left - margin.right
    const height = 400

    // create SVG
    const svg = div.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // scales
    const xScale = d3.scaleBand()
      .domain([...new Set(filteredData.map(d => d['Airline Name']))]) // unique airlines
      .range([0, width])
      .padding(0.05)

    const yScale = d3.scaleBand()
      .domain(d3.range(1, 11)) // ratings from 1 to 10
      .range([height, 0])
      .padding(0.05)

    const colorScale = d3.scaleLinear()
      .domain([0, d3.max(heatmapData, d => d.count) || 1])
      .range([d3.rgb('#B9D9EB'), d3.rgb('#002366')])

    // draw heatmap squares
    svg.selectAll()
      .data(heatmapData)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.airline))
      .attr('y', d => yScale(d.rating))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.count || 0))

    // add axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-65)')
      .style('text-anchor', 'end')
      .style('font-size', '12px')

    svg.append('g').call(d3.axisLeft(yScale).tickFormat(d => `${d}-Star`)).style('font-size', '12px')

    // add color legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width + 10}, 0)`)

    const legendScale = d3.scaleLinear()
      .domain([0, d3.max(heatmapData, d => d.count) || 1])
      .range([height, 0])

    legend.append('g').call(d3.axisRight(legendScale).ticks(5))
      .style('font-size', '12px')

    const legendColors = d3.range(0, d3.max(heatmapData, d => d.count) || 1, 1).map(d => ({
      value: d,
      color: colorScale(d)
    }))

    legend.selectAll('rect')
      .data(legendColors)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', d => legendScale(d.value))
      .attr('width', 10)
      .attr('height', (height / (d3.max(heatmapData, d => d.count) || 1)))
      .attr('fill', d => d.color)
  }

  plot () {
    if (this._plotChart === undefined) {
      throw new Error('_plotChart method must be implemented')
    }

    d3.select('#titleDiv3').selectAll('*').remove()
    d3.select('#chartDiv3').selectAll('*').remove()

    this._plotDescription(d3.select('#titleDiv3'))
    this._plotChart(d3.select('#chartDiv3'))
  }
}
