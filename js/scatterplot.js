var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var x = d3.scale.linear().range([0, width]); //d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(10);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(15);

var valueline = d3.svg.line()
    .x(function(d) { return x(d.Seconds); })
    .y(function(d) { return y(d.Place); });

var tip = d3.select('body')
    .append('div')
    .attr('class', 'tip')
    .style('border', '1px solid steelblue')
    .style('padding', '5px')
    .style('position', 'absolute')
    .style('display', 'none')
    .on('mouseover', function(d, i) {
            tip.transition().duration(0);
      })
      .on('mouseout', function(d, i) {
            tip.style('display', 'none');
      });

var svg = d3.select("body")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

d3.select("#script-warning").html(" ");

d3.csv("./resources/scatter.csv", function(error, data) {
    data.forEach(function(d) {
        console.log(d);
        d.Seconds = +d.Seconds - 2210; //this gives seconds past leading time(hardcoded)
        d.Place = +d.Place;//+d.close;
        if (d.Doping == "") {
            d.Doping = "CLEAN!";
        }
    });

    //x.domain(d3.extent(data, function(d) { return d.Seconds; }));
    x.domain([0, 210]); //This data wont ever be changed, lets just hard code the domain.
    y.domain([0, d3.max(data, function(d) { return d.Place; })]);

    /* A path line doesn't make too much sense looking at it
    svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(data));
    */
    
    svg.selectAll("dot")
        .data(data)
      .enter().append("circle")
        .attr("r", 6.5)
        .attr("cx", function(d) { return x(d.Seconds); })
        .attr("cy", function(d) { return y(d.Place); })
        .on('mouseover', function(d) {
            tip.transition().duration(0)
            tip.style('top', '100px') //y(d.Place) - 20 + 'px')
            tip.style('left', '100px') //x(d.Seconds) + 'px')
            tip.style('display', 'block')
            tip.html('<b>'+d.Name+'</b><br>'+d.Year+'<br>'+d.Time+'<br><i>'+d.Doping+'</i>')
        })
        .on('mouseout', function(d) {
            tip.transition()
            .delay(1000)
            .style('display', 'none');
        })
        .style("fill", function(d) {
            if (d.Doping == "CLEAN!") {
                return "green";
            }
                return "red";
        });

    svg.selectAll("text")
        .data(data)
      .enter().append("text")
        .text(function(d) { return d.Name+", "+d.Nationality; })
        .attr("x", function(d) { return x(d.Seconds); })
        .attr("y", function(d) { return y(d.Place); })
        .attr("transform", "translate(8,+3)")
        .style("font-weight", function(d) { return (d.Doping == "") ? "bold" : ""; });
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
});