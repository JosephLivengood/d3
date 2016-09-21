var url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json";

var color = d3.scale.linear().range(["green", "blue", "yellow", "red"]).domain([0.0, 0.05, 0.1, 0.2])

var width = '100%',
    height = '100%',
    sizeModifier = 50,
    hue = 0, colors = {},
    meteorites;

var projection = d3.geo.mercator()
  .translate([880,560])
  .scale(250);

var zoom = d3.behavior.zoom()
  .translate([0, 0])
  .scale(1)
  .scaleExtent([.5, 18])
  .on("zoom", zoomed);

var path = d3.geo.path()
  .projection(projection);

var svg = d3.select('#container')
  .append('svg')
  .attr('width', '100%')

svg.append('rect')
  .attr('width', width)
  .attr('height', height)
  .attr('fill', 'white')
  .call(zoom);

d3.select(window).on("resize", sizeChange);

var div = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

var map = svg.append('g');

d3.select("#script-warning").html("");

d3.json('https://raw.githubusercontent.com/mbostock/topojson/master/examples/world-50m.json', function(json) {
  map.selectAll('path')
    .data(topojson.feature(json, json.objects.countries).features)
    .enter()
    .append('path')
    .attr('fill', 'lawngreen')
    .attr('stroke', 'white')
    .attr('d', path)
    //.call(zoom); //data set too large to do this this simple
});

d3.json(url, function(json) {
  json.features.sort(function(a,b) {
    return new Date(a.properties.year) - new Date(b.properties.year);
  })
  json.features.map(function(e) {
    hue+=.35;
    colors[e.properties.year] = hue;
    e.color = 'hsl(' + hue + ',100%, 50%)';
  })
  json.features.sort(function(a,b) {
    return b.properties.mass - a.properties.mass
  })

  meteorites = svg.append('g')
  .selectAll('path')
    .data(json.features)
    .enter()
      .append('circle')
      .attr('cx', function(d) { return projection([d.properties.reclong,d.properties.reclat])[0] })
      .attr('cy', function(d) { return projection([d.properties.reclong,d.properties.reclat])[1] })
      .attr('r', function(d) { 
        var size = 50 * d.properties.mass / 2000000;
        if (size > 50) {
            size = 50;
        } else if (size < 4) {
            size = 4;
        }
        return size;
      
      })
      .attr('fill-opacity', function(d) {
        var range = 718750/2/2;
        if (d.properties.mass <= range) return 1;
        return .5;
      })
      .attr('stroke-width', 1)
      .attr('stroke', '#EAFFD0')
      .attr('fill', function(d) {
        var z = d.properties.mass/1000000;
        return color(z)
      })
      .on('mouseover', function(d) {
        d3.select(this).attr('d', path).style('fill', 'black');
        div.transition()
          .duration(500)
          .style('opacity', .8);
        div.html( '<span class="def">mass:</span> ' + d.properties.mass + '<br>' + 
                  '<span class="def">name:</span> ' + d.properties.name + '<br>' + 
                  '<span class="def">year:</span> ' + d.properties.year.substr(0,4) + '<br>')
          .style('left', (d3.event.pageX+30) + 'px')
          .style('top', (d3.event.pageY/1.5) + 'px')
      })
      .on('mouseout', function(d) {
        d3.select(this).attr('d', path).style('fill', function(d) { return d.properties.hsl });
        div.transition()
          .duration(1000)
          .style('opacity', 0);
      });
  sizeChange();
});

function zoomed() {
  map.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  meteorites.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
}

function sizeChange() {
  d3.selectAll("g").attr("transform", "scale(" + $("#container").width()/1900 + ")");
  $("svg").height($("#container").width()/2);
}