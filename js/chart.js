/***
Pew-style parts-of-a-whole charts for racial makeup of schools in BPS, 
grouped by type, in 1994 and 2014. Bonus if we can get 1974.

Relies on D3, built with divs.

Each row represents a school, divided into proportional blocks for each racial group.
On mobile (or very narrow width), school name sits above the bar. On wider views,
label floats left.
***/
var margin = {top: 10, right: 10, bottom: 10, left: 10}
  , width = parseInt(d3.select('#chart').style('width'), 10)
  , width = width - margin.left - margin.right;

var chart = d3.select('#chart');

var RACE_FIELDS = [
    'AfricanAmerican', 
    'Hispanic', 
    'Asian', 
    'White', 
    'NativeAmerican',
];

// scales, simple percents
var x = d3.scale.linear()
    .domain([0, 101])
    .range([0, 100]);

var color = d3.scale.category20()
    .domain(RACE_FIELDS);

d3.csv('data/2014.csv').row(function(d, i) {
    // fix numerics
    d.AfricanAmerican = +d.AfricanAmerican;
    d.Hispanic = +d.Hispanic;
    d.Asian = +d.Asian;
    d.White = +d.White;
    d.NativeAmerican = +d.NativeAmerican;
    d.year = +d.year;

    return d;
}).get(render);

function render(err, data) {
    data = window.data = data.filter(function(d) { 
        return _(d).chain().pick(RACE_FIELDS).values().sum().value() > 90;
    });

    var rows = chart.selectAll('div.school')
        .data(data, function(d) { return d.ORGCODE; })
      .enter()
        .append('div')
        .attr('class', 'school row');

    rows.append('div')
        .attr('class', 'school-name col-md-2 col-sm-3 col-xs-5 text-right')
        .attr('data-school', function(d) { return d.school; })
        .text(function(d) { return d.school; });

    var bars = rows.append('div')
        .attr('class', 'racial-makeup col-md-10 col-sm-9 col-xs-7')
      .selectAll('div.race')
        .data(
            // data is k/v pairs of race, percent; id is race key
            function(d) { return _(d).chain()
                .pick(RACE_FIELDS)
                .pairs()
                .sort(function(d) { return d3.ascending(d[0]); })
                .value(); },

            function(d) { return d[0]; });

    bars.enter().append('div')
        .attr('class', function(d) {
            return 'race ' + d[0];
        })
        .style('width', function(d) { return x(d[1]) + '%'; })
        .style('background-color', function(d) { return color(d[0]); })
        //.text(function(d) { return d[1]; });
}

function sum(array) {
    return array.reduce(function(m, d) { return m + d; }, 0);
}

_.mixin({ sum: sum });