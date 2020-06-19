var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1080 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 

const circleRadius = 6;

// setup x 
var xValue = function(d) { return d.Emotioneel_Eenzaam;}, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
var yValue = function(d) { return d["Eenzaamheid"];}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// setup fill color


var cValue = function(d) { return d.Regio;},
    //color = d3.scale.category10();
    color = d3.scale.ordinal()
      .range(colorbrewer.Oranges[4]);


// add the graph canvas to the body of the webpage
var svg = d3.select("body").append("svg")
    .attr("class", "scatter")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip-header")
    .style("opacity", 0);

// load data
d3.csv("data/eenzaamheid_vs_emotioneel.csv", function(error, data) {

  // change string (from CSV) into number format
  data.forEach(function(d) {
    d.Emotioneel_Eenzaam = +d.Emotioneel_Eenzaam;
    d["Eenzaamheid"] = +d["Eenzaamheid"];
 //   console.log(d);
  });

  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+5]);
  yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+5]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .style('fill', 'white')
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Emotionele eenzaamheid in %")
      .style('fill', 'white');

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .style('fill', 'white')
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Algemene eenzaamheid in %")
      .style('fill', 'white');

  // draw dots
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", circleRadius)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) { return color(cValue(d));}) 
      
      .on("mouseover", function(d) {
        /*
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Provincie"] + "<br/> (" + xValue(d) 
          + ", " + yValue(d) + ")")
               .style("left", (d3.event.pageX + 25) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
*/
          d3.selectAll(".dot").
              style("opacity", 0.15);
          d3.select(this).style("opacity", 1);
          d3.select(this) 
              .attr("r", circleRadius*2.5);
          d3.select(".tooltip") //tooltipHeader
         .transition().duration(500);

          tooltip.html("<ul>\n<li><span class=\"name\">" + d.Provincie + "</span>,  " + d.Regio + "</li> \n <li>Algemene eenzaamheid: " + d.Eenzaamheid + "%</li>   \n  <li>Emotionele eenzaamheid: " +
          d.Emotioneel_Eenzaam +"%</li>\n " + "\n</ul>")
          .style("opacity", .9)
          .style("font-size", 15 + "px")
          .style("left", (d3.event.pageX + 20) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
              
     })

      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
          d3.select(this).attr("r", circleRadius); 
          d3.selectAll(".dot").style("opacity", 1);

          d3.select(".tooltip-header").
          transition().
          duration(100).
          style("opacity", 0);
      });



  // draw legend
  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // draw legend colored rectangles
  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  // draw legend text
  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .style('fill', 'white')
      .text(function(d) { return d;})
});