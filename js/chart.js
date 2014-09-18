/***
Pew-style parts-of-a-whole charts for racial makeup of schools in BPS, 
grouped by type, in 1994 and 2014. Bonus if we can get 1974.

Relies on D3, built with divs.

Each row represents a school, divided into proportional blocks for each racial group.
On mobile (or very narrow width), school name sits above the bar. On wider views,
label floats left.

Requires global URLS for data/urls.js

***/
var margin = {top: 10, right: 10, bottom: 10, left: 10}
  , width = parseInt(d3.select('#chart').style('width'), 10)
  , width = width - margin.left - margin.right;

var chart = d3.select('#chart');

var RACE_KEY = {
    AfricanAmerican: 'African American', 
    Asian: 'Asian', 
    Hispanic: 'Hispanic', 
    NativeAmerican: 'Native American', 
    White: 'White', 
    PacificIslander: 'Pacific Islander', 
    Multi: 'Multi-race'
};

var RACE_FIELDS = _.keys(RACE_KEY).sort();

// slider
var slider = $('#slider').noUiSlider({
    start: 0,
    step: 1,
    range: {
        min: 0,
        max: _.size(URLS) - 1
    }
});

slider.on('slide', function(e, value) {
    value = +value;
    update_schools(value);

    $('h1 .year').text(_.keys(URLS)[value]);
});

// scales, simple percents
var x = d3.scale.linear()
    .domain([0, 102]) // handling rounding, should be a better way
    .range([0, 100]);

var color = d3.scale.category20()
    .domain(RACE_FIELDS);

var q = queue();
_.each(URLS, function(url, year) {
    q.defer(d3.csv, url, numerics);
});
q.awaitAll(render);

// make a legend
d3.select('ul#legend')
    .selectAll('li.key')
    .data(_.pairs(RACE_KEY).sort(function(a, b) { return d3.ascending(a[0], b[0]); }))
  .enter().append('li')
    .attr('class', function(d) { return 'key ' + d[0]; })
    .style('background-color', function(d) { return color(d[0]); })
    .text(function(d) { return d[1]; });



function render(err, data) {

    window.data = data;

    var rows = chart.selectAll('div.school')
        .data(data[0], function(d) { return d.ORGCODE; });

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
        .attr('class', 'school-name col-md-3 col-sm-3 text-right') // col-xs-5
        .attr('data-school', function(d) { return d.school; })
        .text(function(d) { return d.school; });

    var bars = rows.append('div')
        .attr('class', 'racial-makeup col-md-9 col-sm-9') // col-xs-7
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

function update_schools(index) {
    var data = window.data[index];

    if (!data) {
        console.error('No data for %s', index);
        return;
    };

    console.log('Updating data for %s', index);

    // bind new data to racial bars
    var schools = chart.selectAll('.school')
        .data(data, function(d) { return d.ORGCODE; });

    schools.enter().call(render_schools);

    schools.exit().remove();

    schools.sort(function(a, b) { return d3.ascending(a.school, b.school); });

    schools.selectAll('.race')
        .data(extract_race_data, function(d) { return d[0]; })
        .style('width', function(d) { return x(d[1]) + '%'; });
}

function extract_race_data(d) { 
    return _(d).chain()
        .pick(RACE_FIELDS)
        .pairs()
        .sort(function(a, b) { return d3.ascending(a[0], b[0]); })
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