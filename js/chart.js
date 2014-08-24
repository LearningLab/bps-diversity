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

RACE_FIELDS = ['AfricanAmerican', 'Asian', 'Hispanic', 'NativeAmerican', 'White', 'PacificIslander', 'Multi'];

// scales, simple percents
var x = d3.scale.linear()
    .domain([0, 101])
    .range([0, 100]);

var color = d3.scale.category20()
    .domain(RACE_FIELDS);

queue()
    .defer(d3.csv, 'data/1994.csv', numerics)
    .defer(d3.csv, 'data/2014.csv', numerics)
    .await(render);

function render(err, data94, data14) {

    var data = window.data = {
        1994: data94,
        2014: data14
    };

    var rows = chart.selectAll('div.school')
        .data(data[2014], function(d) { return d.ORGCODE; });

    rows.enter().call(render_schools);

}

/***
Render a row for each school,
to be called on an entering selection
***/
function render_schools(selection) {
    var rows = selection.append('div')
        .attr('class', 'school row');

    rows.append('div')
        .attr('class', 'school-name col-md-3 col-sm-3 col-xs-5 text-right')
        .attr('data-school', function(d) { return d.school; })
        .text(function(d) { return d.school; });

    var bars = rows.append('div')
        .attr('class', 'racial-makeup col-md-9 col-sm-9 col-xs-7')
      .selectAll('div.race')
        .data(
            // data is k/v pairs of race, percent; id is race key
            extract_race_data,
            function(d) { return d[0]; });

    bars.enter().append('div')
        .attr('class', function(d) {
            return 'race ' + d[0];
        })
        .style('width', function(d) { return x(d[1]) + '%'; })
        .style('background-color', function(d) { return color(d[0]); })

}

function update_schools(year) {
    var data = window.data[year];

    if (!data) {
        console.error('No data for %s', year);
        return;
    };

    console.log('Updating data for %s', year);

    // bind new data to racial bars
    var schools = chart.selectAll('.school')
        .data(data, function(d) { return d.ORGCODE; });

    schools.enter().call(render_schools);

    schools.selectAll('.race')
        .data(extract_race_data, function(d) { return d[0]; })
      //.transition()
        .style('width', function(d) { return x(d[1]) + '%'; });

    schools.exit().remove();

}

function extract_race_data(d) { 
    return _(d).chain()
        .pick(RACE_FIELDS)
        .pairs()
        .sort(function(d) { return d3.ascending(d[0]); })
        .value();
}

function numerics(d, i) {
    // fix numerics
    d.AfricanAmerican = +d.AfricanAmerican;
    d.Hispanic = +d.Hispanic;
    d.Asian = +d.Asian;
    d.White = +d.White;
    d.NativeAmerican = +d.NativeAmerican;
    d.year = +d.year;

    return d;
}

function sum(array) {
    return array.reduce(function(m, d) { return m + d; }, 0);
}

_.mixin({ sum: sum });