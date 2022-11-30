// https://github.com/johnwalley/d3-simple-slider

var width = 1200,
    height = 600;

var svg1 = d3.select('#map1').append('svg')
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

d3.select('#slider1')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(100,40)')
    .call(slider);

Promise.all([
    d3.json("final_data/gz_2010_us_050_00_20m.json"),
    d3.csv("final_data/living_wage_simplified.csv"),
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

    d3.select('#map1').selectAll('path').remove();


    svg1.selectAll('path')
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
                d3.select('.tooltip1')
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
            d3.select('.tooltip1')
                .style('visibility','hidden');
        });

    svg1.append("g")
        .attr("class", "legendDiverge")
        .attr("transform", "translate(1050,250)");

    var colorBar = d3.legendColor()
        // .cells([-10000, 10000])
        // .labels(['f','f','f','f','f'])
        .title("Living wage")
        .labelFormat(d3.format("$.2f"))
        .ascending(true)
        .scale(color_scale);
      
    svg1.select(".legendDiverge")
        .call(colorBar);
    svg1.selectAll('text')
        .style('font-size', "12px")

}


// --------------------------------------------------------------------



// https://github.com/johnwalley/d3-simple-slider

var width = 1200,
    height = 600;

var svg2 = d3.select('#map2').append('svg')
    .attr('height', height)
    .attr('width', width);

var proj = d3.geoAlbersUsa()
    .scale(1300)
    .translate([width/2, height/2]);
var path_gen = d3.geoPath(proj);
var g_lw;
var g_counties;
var g_stipends;

var slider = d3
    .sliderHorizontal()
    .min(2013)
    .max(2022)
    .step(1)
    .width(300)
    .displayValue(true)
    .on('onchange', (val) => {
      readyToDraw2(g_counties, g_lw, g_stipends, val);
    });
slider.tickFormat(d3.format('d'));
slider.value(2022);

d3.select('#slider2')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(100,40)')
    .call(slider);

Promise.all([
    d3.json("final_data/gz_2010_us_050_00_20m.json"),
    d3.csv("final_data/living_wage_simplified.csv"),
    d3.csv("final_data/phd_stipends_cleaned.csv")
]).then(function(data) {
    var counties = data[0]['features']
    var lw = data[1]
    var stipends = data[2]
    readyToDraw2(counties, lw, stipends, "2022")
})

function readyToDraw2(counties, lw, stipends, year) {
    g_counties = counties
    g_lw = lw
    g_stipends = stipends

    data = lw.filter(function(d) {
        return d.year == year
    })
    stipend_data = stipends.filter(function(d) {
        return d["Academic Year"] == year
    })

    var data_map = d3.map()
    data.forEach(function(d) {
        data_map.set(d['fips_code'], d);
    })
    var stipend_map = d3.map()
    stipend_data.forEach(function(d) {
        stipend_map.set(d["fips_code"], d)
    })
    counties.forEach(function(d, i) {
        fips_code = d['properties']['STATE'] + d['properties']['COUNTY']
        if (stipend_map.has(fips_code)) {
            s_data = stipend_map.get(fips_code);
            data = s_data['Overall Pay']
            counties[i]["properties"]["LW"] = data
        } else {
            counties[i]["properties"]["LW"] = 0
        }
    })

    var pay_values = stipend_map.values().map(function(d) {
        return +d["Overall Pay"]
    })
    var lw_pay_values = stipend_map.values().map(function(d) {
        return +d["Overall Pay"] - +d["living_wage"]
    })
    var max = d3.max(pay_values),
        min = d3.min(pay_values);
    var pay_scale = d3.scaleSqrt()
        .domain([min, max])
        .range([0,20]);

    var max = d3.max(lw_pay_values),
        min = d3.min(lw_pay_values);
    var lw_pay_scale = d3.scaleDiverging()
        .domain([min, 0, max])
        .interpolator(d3.interpolateRdBu);


    var colors = ['#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d']
    
    
    var all_values = data_map.values().map( function(d){
        return +d['living_wage'];
    });

    var color_scale = d3.scaleQuantile()
        .domain(all_values)
        .range(colors);

    d3.select('#map2').selectAll('path').remove();
    d3.select('#map2').selectAll('circle').remove();
    d3.select('#map2').selectAll('text').remove();
    d3.select('#map2').selectAll('.legendDiverge').remove();


    svg2.selectAll('path')
        .data(counties)
        .enter()
        .append('path')
        .attr('d', path_gen)
        .style('fill', '#ECECEC')
        .style('opacity', 0.8)
        .style('stroke', 'black')
        .style('stroke-width', 0.5)

    svg2.append("g")
        .attr("class", "bubble")
        .selectAll("circle")
        .data(counties
            .sort(function(a, b) { return b.properties.LW - a.properties.LW; }))
        .enter()
        .append("circle")
        .attr("transform", function(d) { return "translate(" + path_gen.centroid(d) + ")"; })
        .attr("opacity", 0.8)
        .style("fill", function(d) {
            fips_code = d['properties']['STATE'] + d['properties']['COUNTY'];
            if (stipend_map.has(fips_code)) {
                s_data = stipend_map.get(fips_code);
                data = s_data['Overall Pay']-s_data['living_wage'];

                return lw_pay_scale(data)
            } else {
                return "white"
            }
        })
        .attr("r", function(d) {
            fips_code = d['properties']['STATE'] + d['properties']['COUNTY'];
            if (stipend_map.has(fips_code)) {
                s_data = stipend_map.get(fips_code);
                data = s_data['Overall Pay']

                return pay_scale(data)
            } else {
                return 0
            }
        })
        .on('mouseover', function(d) {
            fips_code = d['properties']['STATE'] + d['properties']['COUNTY'];
            d3.select(this)
                .style('opacity', 1);
            if (stipend_map.has(fips_code)) {
                s_data = stipend_map.get(fips_code);

                d3.select('.tooltip2')
                    .style('visibility','visible')
                    .style('top', d3.event.pageY+10 + 'px')
                    .style('left', d3.event.pageX+10 + 'px')
                    .html('<strong>' + s_data["University"] + 
                        '</strong><br />Average stipend: $' + Math.round(s_data["Overall Pay"]) +
                        '<br />Stipend deficit/surplus: $' + Math.round(s_data["Overall Pay"] - s_data['living_wage']));
            }
        })
        .on('mouseout', function(d) {
            d3.select(this)
                .style('opacity', 0.8);
            d3.select('.tooltip2')
                .style('visibility','hidden');
        });
      

    svg2.append("g")
        .attr("class", "legendDiverge")
        .attr("transform", "translate(1050,250)");

    var colorBar = d3.legendColor()
        .title("Stipend deficit/surplus")
        .labelFormat(d3.format("$d"))
        .ascending(true)
        .scale(lw_pay_scale);
      
    svg2.select(".legendDiverge")
        .call(colorBar);
    svg2.selectAll('text')
        .style('font-size', "12px")

    var legend = svg2.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width -125) + "," + (height - 100) + ")")
        .selectAll("g")
        .data([20000, 40000])
        .enter().append("g");

    legend.append("circle")
        .attr("cy", function(d) { return -pay_scale(d); })
        .attr("r", pay_scale);

    legend.append("text")
        .text("Stipend")
        .style('font-size', '12px')
        .style('fill', 'black')
        .attr("y", -50)
        .attr("x", -5)
    legend.append("text")
        .attr("y", function(d) { return -2 * pay_scale(d); })
        .attr("dy", "1.3em")
        .text(d3.format("$.1s"));

  
}


// -----------------------------------------------------------------------------

