{
    let svg = d3
        .select('#eduOcc')
        .select("svg");

    // Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
    let svgWidth = +svg.attr('width');
    let svgHeight = +svg.attr('height');

    // Define a padding object
    // This will space out the trellis subplots
    let padding = { t: 20, r: 250, b: 60, l: 60 };

    let yearDomain
    let salaryDomain
    let yearScale
    let salaryScale
    let educationScale

    // tooltip 
    let mouse_coord = [0, 0]
    let toolTip = d3.select('.tooltip3')
    toolTipLock = false
    lockCategory = null


    function updateOccEdu(dataset, selectedCategory) {

        // sorting is done to ensure the relevant data is moved to front
        // update lines

        svg.selectAll(".dPath")
            .sort(function (a, b) {
                return d3.ascending(a.key.slice(0, 3) == selectedCategory,
                    b.key.slice(0, 3) == selectedCategory)

            })
            .attr("stroke", function (ds) {
                if (ds != null) {
                    if (ds.key.slice(0, 3) == selectedCategory) {
                        return educationScale(ds.key.slice(4,))
                    } else {
                        return "grey"
                    }
                }
            })
            .attr("opacity", function (ds) {
                if (ds != null) {
                    if (ds.key.slice(0, 3) == selectedCategory) {
                        return 1
                    } else {
                        return 0.1
                    }
                }
            })

        // update points
        svg.selectAll(".dataDot")
            .sort(function (a, b) {
                return d3.ascending(a["Category"] == selectedCategory,
                    b["Category"] == selectedCategory)
            })
            .attr("fill", function (d) {
                if (d["Category"] == selectedCategory) {
                    return educationScale(d["Education"])
                } else {
                    return "grey"
                }
                return
            })
            .attr("opacity", function (d) {
                if (d["Category"] == selectedCategory) {
                    return 1
                } else {
                    return 0
                }
                return
            })

    }

    // Educational Obtainment, Occupation, and Salary Graph
    d3.csv('./edu_occ_and_tot_earn/edu_occ.csv').then(function (dataset) {

        dataset.forEach(function (d) {
            d["Salary"] = Math.round(d["Salary"])
        })

        // define x and y extent
        yearDomain = d3.extent(dataset, function (d) {
            return +d["Year"]
        });
        salaryDomain = d3.extent(dataset, function (d) {
            return +d["Salary"]
        });
        // create scales
        yearScale = d3.scaleLinear()
            .domain(yearDomain)
            .range([padding.l, svgWidth - padding.r])
        salaryScale = d3.scaleLinear()
            .domain(salaryDomain)
            .range([svgHeight - padding.t, padding.b])
        educationScale = d3.scaleOrdinal(d3.schemeCategory10)


        let nested_dataset = d3.nest()
            .key(function (d) { return [d.Category, d.Education] })
            .entries(dataset)

        console.log(nested_dataset)


        svg.selectAll(".line")
            .data(nested_dataset, function (d) {
                return d.key
            })
            .enter()
            .append("path")
            .attr("class", "dPath")
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("opacity", 0.1)
            .attr("stroke-width", 10)
            .attr("d", function (ds) {
                return d3.line()
                    .x(function (d) { return yearScale(+d["Year"]) })
                    .y(function (d) { return salaryScale(+d['Salary']) })
                    (ds.values)
            })
            .on("mouseover", function (d) {
                if (!toolTipLock) {
                    let selectedCategory = d.key.slice(0, 3)
                    updateOccEdu(dataset, selectedCategory)
                }
            })
            .on("mouseout", function (d) {
                if (!toolTipLock) {
                    svg.selectAll("path")
                        .attr("stroke", "grey")
                        .attr("opacity", 0.1)
                    svg.selectAll(".dataDot")
                        .attr("fill", "grey")
                        .attr("opacity", 0)
                }
            })
            .on("click", function (d) {
                toolTipLock = !toolTipLock
                lockCategory = d.key.slice(0, 3)
            })


        svg.selectAll()
            .data(dataset, function (d) {
                return [d["Category"], d["Education"], d["Year"]]
            })
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return yearScale(+d["Year"])
            })
            .attr("cy", function (d) {
                return salaryScale(+d["Salary"])
            })
            .attr("class","dataDot")
            .attr("stroke", "black")
            .attr("r", 4)
            .attr("opacity", 0)
            .on("mouseover", function (d) {
                if (!toolTipLock || lockCategory == d["Category"]) {
                    toolTip
                        .style('visibility', 'visible')
                        .style('top', d3.event.pageY + 10 + 'px')
                        .style('left', d3.event.pageX + 10 + 'px')
                        .html('Education: ' + d["Education"] +
                            '<br />Occupation Class: ' + occ_dict[ d["Category"] ] +
                            '<br />Salary: $' + d["Salary"] );
                }
                if (!toolTipLock) {
                    let selectedCategory = d["Category"]
                    updateOccEdu(dataset, selectedCategory)
                }
            })
            .on("mouseout", function (d) {
                toolTip.style('visibility', 'hidden');
                if (!toolTipLock) {

                    svg.selectAll("path")
                        .attr("stroke", "grey")
                        .attr("opacity", 0.1)
                    svg.selectAll(".dataDot")
                        .attr("fill", "grey")
                        .attr("opacity", 0)
                }
            })
            .on("click", function (d) {
                toolTipLock = !toolTipLock
                lockCategory = d["Category"]
            })



        // x axis
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(10,' + padding.t + ')')
            .call(d3.axisBottom(yearScale).tickFormat(d3.format("d")))

        // y axis
        svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + padding.l + ',0)')
            .call(d3.axisLeft(salaryScale));

        //d3.legend(educationScale)

        // bottom x axis label
        svg.append("text")
            .attr("class", "axisLabel")
            .attr("transform", "translate(500,10)")
            .attr("dy", "0.3em")
            .text("Year");

        // left y axis label
        svg.append("text")
            .attr("class", "axisLabel")
            .attr("transform", "translate(20,370)rotate(270)")
            .attr("dy", "-0.2em")
            .text("Mean Salary ($)");

        // legend
        let educations = ["Bachelor's", "Master's/Professional", "Doctorate" ]
        svg.selectAll(".legend")
            .data(educations)
            .enter()
            .append("circle")
            .attr("class","legendDot")
            .attr("cx", 780)
            .attr("cy", function (d, i) { return svgHeight / 2 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", function (d) { return educationScale(d) })

        svg.selectAll(".legend")
            .data(educations)
            .enter()  
            .append("text")
            .text(d => d)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .attr("x", 800)
            .attr("y", function (d, i) { return svgHeight / 2 + i * 25 })

        svg.append("text")
            .text("Educational Attainment")
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .attr("x", 780)
            .attr("y", svgHeight / 2 - 25)
    });

}


    