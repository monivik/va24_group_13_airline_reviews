import './index.scss'
import * as d3 from 'd3'
import MyBarchart from './01_barChart'
import MyLinechart from './02_lineChart'
import MyHeatmap from './03_heatMap'

const collection = [
  new MyBarchart('myBarchart', 'Cumulative Average Rating'),
  new MyLinechart('myLinechart', 'Average Rating Over Years'),
  new MyHeatmap('myHeatmap', 'Distribution of Ratings')
]

// Function to highlight the selected airline in the bar chart
function highlightBar (selectedAirline) {
  collection[0].highlightBar(selectedAirline) // Pass the selected airline to MyBarchart
}

// Initialize the line chart with the callback
collection[1].setOnAirlineSelect(highlightBar)

collection[0].setOnAirlineSelect((selectedAirline) => {
  collection[1].updateSelectedAirline(selectedAirline)
  collection[1].updateDropdown(selectedAirline)
})

// Each chart should go into a specific div
d3.select('#titleDiv1').each(() => collection[0]._plotDescription(d3.select('#titleDiv1')))
d3.select('#chartDiv1').each(() => collection[0]._plotChart(d3.select('#chartDiv1')))

d3.select('#titleDiv2').each(() => collection[1]._plotDescription(d3.select('#titleDiv2')))
d3.select('#chartDiv2').each(() => collection[1]._plotChart(d3.select('#chartDiv2')))

d3.select('#titleDiv3').each(() => collection[2]._plotDescription(d3.select('#titleDiv3')))
d3.select('#chartDiv3').each(() => collection[2]._plotChart(d3.select('#chartDiv3')))

d3.select('#headerDiv')
  .append('h1')
  .attr('class', 'header-title')
  .text('TOP 10 Airlines - Customer Ratings')

d3.select('#footerDiv')
  .attr('class', 'footer-title')
  .text('Data: Airline Reviews Dataset from airlinequality.com')
