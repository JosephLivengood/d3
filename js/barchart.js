//SUPER SUPER SUPER WIP
var data = [];

/*
* getData() is NOT async. We need to load the full data set before trying to draw.
*/
function getData() {
    $.ajax(
    {
        url: "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json",
        dataType: "json",
        async: false,
        success: function (d) {
            $.each(d.data, function (key, val) {
                data.push({label: val[0], value: val[1]});
            });
        },
        error: function (xhr, err) {
            alert("readyState: " + xhr.readyState +
                    "\nstatus: " + xhr.status);
            alert("responseText: " + xhr.responseText);
        }
    }
    )
};
    
    d3.select("#script-warning").html(" ");
    getData();
    var div = d3.select("body").append("div").attr("class", "toolTip");
    var axisMargin = 10,
            margin = 10,
            valueMargin = 10,
            width = parseInt(d3.select('body').style('width'), 10),
            height = parseInt(d3.select('body').style('height'), 10),
            barHeight = (height-axisMargin-margin*2)* 0.9/data.length,
            barPadding = (height-axisMargin-margin*2)*0.0/data.length,
            data, bar, svg, scale, xAxis, labelWidth = 0;

    max = d3.max(data, function(d) { return d.value; });

    svg = d3.select('.barchart')
            .append("svg")
            .attr("width", width)
            .attr("height", height);

    bar = svg.selectAll("g")
            .data(data)
            .enter()
            .append("g");

    bar.attr("class", "bar")
            .attr("cx",0)
            .attr("transform", function(d, i) {
                return "translate(" + margin + "," + (i * (barHeight + barPadding) + barPadding) + ")";
            });

    bar.append("text")
            .attr("class", "label")
            .attr("y", barHeight / 2)
            .attr("dy", ".35em") //vertical align middle
            .text(function(d){
                if (d.label.includes('-04-')){ //we only want 1 label per year to keep it not crowded
                    return d.label.substring(0,4)+".";
                } else {
                    return;
                }   
            }).each(function() {
        labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));
    });

    scale = d3.scale.linear()
            .domain([0, 19000])
            .range([0, width - margin*2 - labelWidth]);

    xAxis = d3.svg.axis()
            .scale(scale)
            .tickSize(-height + 2*margin + axisMargin)
            .orient("bottom");

    bar.append("rect")
            .attr("transform", "translate("+labelWidth+", 0)")
            .attr("height", barHeight)
            .attr("width", function(d){
                return scale(d.value);
            });

    bar.append("text")
            .attr("class", "value")
            .attr("y", barHeight / 2)
            .attr("dx", -valueMargin + labelWidth - 50) //margin right
            .attr("dy", ".35em") //vertical align middle
            .attr("text-anchor", "end")
            .text(function(d){
                if(d.label == "2010-07-01") {
                    return "Bad banking policy and massive bank bailouts!";
                }
                return; //(d.value+"m"); //@/1000
            })
            .attr("x", function(d){
                var width = this.getBBox().width;
                return Math.max(width + valueMargin, scale(d.value));
            });

    bar
            .on("mousemove", function(d){
                div.style("left", d3.event.pageX+10+"px");
                div.style("top", d3.event.pageY-25+"px");
                div.style("display", "inline-block");
                div.html((d.label)+"<br>"+(d.value)+"m");
            });

    bar
            .on("mouseout", function(d){
                div.style("display", "none");
            });

    svg.insert("g",":first-child")
            .attr("class", "axisHorizontal")
            .attr("transform", "translate(" + (margin + labelWidth) + ","+ (height - axisMargin - margin - 100)+")")
            .call(xAxis);
