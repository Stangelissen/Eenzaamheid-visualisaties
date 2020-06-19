// Dimensions of sunburst.
var width = 750;
var height = 600;
var radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 150, h: 30, s: 3, t: 10
};

// Mapping of step names to colors.
var colors = {

  //Zuid limburg onderverdeeld in wijken
  "zuid_limburg": "#d62f26",
  "zuidlimburg": "#761528",
  "limburg": "",
  
  "sittardgeleen": "#eb5b3a",
  "stein": "#eb5b3a",
  "onderbanken": "#eb5b3a",
  "schinnen": "#eb5b3a",
  "beek": "#eb5b3a",
  "meerssen": "#eb5b3a",
  "brunssum": "#eb5b3a",
  "heerlen": "#eb5b3a",
  "nuth": "#eb5b3a",
  "maastricht": "#eb5b3a",
  "valkenburg": "#eb5b3a",
  "voerendaal": "#eb5b3a",
  "landgraaf": "#eb5b3a",
  "kerkrade": "#eb5b3a",
  "simpelveld": "#eb5b3a",
  "gulpen": "#eb5b3a", 
  "vaals": "#eb5b3a",
  "eijsden": "#eb5b3a",

//eenzaamheid 
  
  "eenzaam": "#f9d984",
  "sterkeenzaam": "#fdeca9",

  "nieteenzaam": "#d3342b",
  "eenzaamheid": "#af232d",

  "sociaaleenzaam": "",
  "emotioneeleenzaam": "",
  "sociaal_eenzaam": "#fdae60",
  "emotioneel_eenzaam": "#fddf90",
  //voor de eenzaamheid sociaal emotioneel chart
  "eenzaamheid.": "#a50026",

  
//Nederland onderdelen

  "nederland": "#f46d42",

//Zeeland
   
    "zeeland": "",
    "borsele": "",
    "goes": "",
    "hulst": "",
    "kapelle": "",
    "middelburg": "",
    "noord_beveland": "",
    "reimerswaal": "",
    "schouwen_duiveland": "",
    "sluis": "",
    "terneuzen": "",
    "tholen": "",
    "veere": "",
    "vlissingen": "",
    

//brabant

    "brabant_zuidoost": "#761528",
    "asten": "#eb5b3a",
    "bergeijk": "#eb5b3a",
    "best": "#eb5b3a",
    "bladel": "#eb5b3a",
    "cranendonck": "#eb5b3a",
    "deurne": "#eb5b3a",
    "eersel": "#eb5b3a",
    "eindhoven": "#eb5b3a",
    "geldrop mierlo": "#eb5b3a",
    "gemert_bakel": "#eb5b3a",
    "geeze_leende": "#eb5b3a",
    "helmond": "#eb5b3a",
    "laarbeek": "#eb5b3a",
    "nuenen": "#eb5b3a",
    "oirschot": "#eb5b3a",
    "reusel": "#eb5b3a",
    "someren": "#eb5b3a",
    "son_en_breugel": "#eb5b3a",
    "valkenswaard": "#eb5b3a",
    "veldhoven": "#eb5b3a",
    "waalre": "#eb5b3a",


//utrecht

    "utrecht": "#761528",
    "vleuten de meern": "#eb5b3a",
    "leidsche rijn": "#eb5b3a",
    "west": "#eb5b3a",
    "zuidwest": "#eb5b3a",
    "zuid": "#eb5b3a",
    "oost": "#eb5b3a",
    "binnenstad": "#eb5b3a",
    "noordwest": "#eb5b3a",
    "overvecht": "#eb5b3a",
    "noordoost": "#eb5b3a",



//leeftijden
    //utrecht
    "19 t/m 39": "",
    "40 t/m 54": "",
    "55 t/m 64": "",
    "65 t/m 79": "",
    "80+": "",
    //nederland
    "19 t/m 34": "#ffffbf",
    "35 t/m 49": "#dff2f7",
    "50 t/m 64": "#aad8e8",
    "65 t/m 74": "#f5b45f",
    "75 t/m 84": "#f5b45f",
    "85+": "#74acd1",    
    //brabant//zeeland
    "19 t/m 64": "#f5b45f", 
    "65+": "#f0924f",
    //zuidlimburg
    "17 t/m 24": "#ffffbf",
    "25 t/m 39": "#dff2f7",
    "40 t/m 54": "#aad8e8",
    "55 t/m 64": "#aad8e8",

 



};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0; 

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.layout.partition()
    .size([2 * Math.PI, radius * radius])
    .value(function(d) { return d.size; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

// Use d3.text and d3.csv.parseRows so that we do not need to have a header
// row, and can receive the csv as an array of arrays.
d3.text("data/utrecht_wijk.csv", function(text) {
  var csv = d3.csv.parseRows(text);
  var json = buildHierarchy(csv);
  createVisualization(json);
});

// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json) {

  // Basic setup of page elements.
  initializeBreadcrumbTrail();
  drawLegend();
  d3.select("#togglelegend").on("click", toggleLegend);

  // Bounding circle underneath the sunburst, to make it easier to detect
  // when the mouse leaves the parent g.
  vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

  // For efficiency, filter nodes to keep only those large enough to see.
  var nodes = partition.nodes(json)
      .filter(function(d) {
      return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
      });

  var path = vis.data([json]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("display", function(d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function(d) { return colors[d.name]; })
      .style("opacity", 1)
      .on("mouseover", mouseover);

  // Add the mouseleave handler to the bounding circle.
  d3.select("#container").on("mouseleave", mouseleave);

  // Get total size of the tree = value of root node from partition.
  totalSize = path.node().__data__.value;
 };

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {

  var percentage = (100 * d.value / totalSize).toPrecision(3);
  var percentageString = percentage + "%";
  if (percentage < 0.1) {
    percentageString = "< 0.1%";
  }

  d3.select("#percentage")
      .text(percentageString);

  d3.select("#explanation")
      .style("visibility", "");

  var sequenceArray = getAncestors(d);
  updateBreadcrumbs(sequenceArray, percentageString);

  // Fade all the segments.
  d3.selectAll("path")
      .style("opacity", 0.3);

  // Then highlight only those that are an ancestor of the current segment.
  vis.selectAll("path")
      .filter(function(node) {
                return (sequenceArray.indexOf(node) >= 0);
              })
      .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

  // Hide the breadcrumb trail
  d3.select("#trail")
      .style("visibility", "hidden");

  // Deactivate all segments during transition.
  d3.selectAll("path").on("mouseover", null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .each("end", function() {
              d3.select(this).on("mouseover", mouseover);
            });

  d3.select("#explanation")
      .style("visibility", "hidden");
}

// Given a node in a partition layout, return an array of all of its ancestor
// nodes, highest first, but excluding the root.
function getAncestors(node) {
  var path = [];
  var current = node;
  while (current.parent) {
    path.unshift(current);
    current = current.parent;
  }
  return path;
}

function initializeBreadcrumbTrail() {
  // Add the svg area.
  var trail = d3.select("#sequence").append("svg:svg")
      .attr("width", width)
      .attr("height", 50)
      .attr("id", "trail");
  // Add the label at the end, for the percentage.
  trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "white");
}

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
  }
  return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {

  // Data join; key function combines name and depth (= position in sequence).
  var g = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) { return d.name + d.depth; });

  // Add breadcrumb and label for entering nodes.
  var entering = g.enter().append("svg:g");

  entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", function(d) { return colors[d.name]; });

  entering.append("svg:text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.name; });

  // Set position for entering and updating nodes.
  g.attr("transform", function(d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });

  // Remove exiting nodes.
  g.exit().remove();

  // Now move and update the percentage at the end.
  d3.select("#trail").select("#endlabel")
      .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(percentageString);

  // Make the breadcrumb trail visible, if it's hidden.
  d3.select("#trail")
      .style("visibility", "");

}

function drawLegend() {

  // Dimensions of legend item: width, height, spacing, radius of rounded rect.
  var li = {
    w: 75, h: 30, s: 3, r: 3
  };

  var legend = d3.select("#legend").append("svg:svg")
      .attr("width", li.w)
      .attr("height", d3.keys(colors).length * (li.h + li.s));

  var g = legend.selectAll("g")
      .data(d3.entries(colors))
      .enter().append("svg:g")
      .attr("transform", function(d, i) {
              return "translate(0," + i * (li.h + li.s) + ")";
           });

  g.append("svg:rect")
      .attr("rx", li.r)
      .attr("ry", li.r)
      .attr("width", li.w)
      .attr("height", li.h)
      .style("fill", function(d) { return d.value; });

  g.append("svg:text")
      .attr("x", li.w / 2)
      .attr("y", li.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.key; });
}

function toggleLegend() {
  var legend = d3.select("#legend");
  if (legend.style("visibility") == "hidden") {
    legend.style("visibility", "");
  } else {
    legend.style("visibility", "hidden");
  }
}

// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how 
// often that sequence occurred.
function buildHierarchy(csv) {
  var root = {"name": "root", "children": []};
  for (var i = 0; i < csv.length; i++) {
    var sequence = csv[i][0];
    var size = +csv[i][1];
    if (isNaN(size)) { // e.g. if this is a header row
      continue;
    }
    var parts = sequence.split("-");
    var currentNode = root;
    for (var j = 0; j < parts.length; j++) {
      var children = currentNode["children"];
      var nodeName = parts[j];
      var childNode;
      if (j + 1 < parts.length) {
   // Not yet at the end of the sequence; move down the tree.
 	var foundChild = false;
 	for (var k = 0; k < children.length; k++) {
 	  if (children[k]["name"] == nodeName) {
 	    childNode = children[k];
 	    foundChild = true;
 	    break;
 	  }
 	}
  // If we don't already have a child node for this branch, create it.
 	if (!foundChild) {
 	  childNode = {"name": nodeName, "children": []};
 	  children.push(childNode);
 	}
 	currentNode = childNode;
      } else {
 	// Reached the end of the sequence; create a leaf node.
 	childNode = {"name": nodeName, "size": size};
 	children.push(childNode);
      }
    }
  }
  return root;
};
