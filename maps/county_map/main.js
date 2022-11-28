// https://github.com/johnwalley/d3-simple-slider

var width = 1200,
    height = 600;

var svg = d3.select('#map').append('svg')
    .attr('height', height)
    .attr('width', width);

var proj = d3.geoAlbersUsa()
    .scale(1300)
    .translate([width/2, height/2]);
var path_gen = d3.geoPath(proj);
var g_lw;
var g_counties;

var slider = d3
    .sliderHorizontal()
    .min(2013)
    .max(2022)
    .step(1)
    .width(300)
    .displayValue(true)
    .on('onchange', (val) => {
      readyToDraw(g_counties, g_lw, val);
    });
slider.tickFormat(d3.format('d'));
slider.value(2022);

d3.select('#slider')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(100,40)')
    .call(slider);

Promise.all([
    d3.json("gz_2010_us_050_00_20m.json"),
    d3.csv("living_wage_simplified.csv"),
]).then(function(data) {
    var counties = data[0]['features']
    var lw = data[1]
    readyToDraw(counties, lw, "2022")
})

function readyToDraw(counties, lw, year) {
    g_counties = counties
    g_lw = lw

    data = lw.filter(function(d) {
        return d.year == year
    })

    var data_map = d3.map()
    data.forEach(function(d) {
        data_map.set(d['fips_code'], d);
    })

    var colors = ['#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d']
    var all_values = data_map.values().map( function(d){
        return +d['living_wage'];
    });

    // Quantile scale
    var color_scale = d3.scaleQuantile()
        .domain(all_values)
        .range(colors);

    // Linear scale
    // var max = d3.max(all_values),
    //     min = d3.min(all_values);
    // var color_scale = d3.scaleLinear()
    //                     .domain([min, max])
    //                     .range([colors[0], colors[colors.length-1]]);

    // Power scale
    // var max = d3.max(all_values),
    //     min = d3.min(all_values);
    // var color_scale = d3.scalePow()
    //                     .domain([min, max])
    //                     .range([colors[0], colors[colors.length-1]])
    //                     .exponent(3);

    // Check out the color scale
    // console.log( color_scale(21) );

    d3.select('#map').selectAll('path').remove();


    svg.selectAll('path')
        .data(counties)
        .enter()
        .append('path')
        .attr('d', path_gen)
        // .style('fill', '#ECECEC')
        .style('fill', function(d) {
            fips_code = d['properties']['STATE'] + d['properties']['COUNTY'];

            // Color only if the data exists for the FIPS code
            if (data_map.has(fips_code)) {
                // Get the entire row of poverty data for each FIPS code
                lw_data = data_map.get(fips_code);

                // Get the specific feature
                data = lw_data['living_wage'];

                return color_scale(data);
            } else {
                return "gray"
            }
        })
        .style('opacity', 0.8)
        .style('stroke', 'black')
        .style('stroke-width', 0.5)
        .on('mouseover', function(d) {
            // Make the county color darker
            d3.select(this)
                .style('opacity', 1);

            // Unload data
            fips_code = d['properties']['STATE'] + d['properties']['COUNTY'];
            if (data_map.has(fips_code)) {
                lw_data = data_map.get(fips_code);

                // Show the tooltip
                d3.select('.tooltip')
                    .style('visibility','visible')
                    .style('top', d3.event.pageY+10 + 'px')
                    .style('left', d3.event.pageX+10 + 'px')
                    .html('<strong>' + lw_data["county"] + ", " + lw_data["state"] + 
                        '</strong><br />Living wage: $' + lw_data["living_wage"] + 
                        '/hr<br />Poverty wage: $' + lw_data["poverty_wage"] + 
                        '/hr<br />Minimum wage: $' + lw_data["minimum_wage"] + '/hr');
            };

            
        })
        .on('mouseout', function(d) {
            // Make the county usual opacity again
            d3.select(this)
                .style('opacity', 0.8);

            // Hide the tooltip
            d3.select('.tooltip')
                .style('visibility','hidden');
        });

    svg.append("g")
        .attr("class", "legendDiverge")
        .attr("transform", "translate(1050,250)");

    var colorBar = d3.legendColor()
        // .cells([-10000, 10000])
        // .labels(['f','f','f','f','f'])
        .title("Living wage")
        .labelFormat(d3.format("$.2f"))
        .ascending(true)
        .scale(color_scale);
      
    svg.select(".legendDiverge")
        .call(colorBar);
    svg.selectAll('text')
        .style('font-size', "12px")

  
}
