{
    let svg = d3
        .select('#eduOcc')
        .select("svg");

    // Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
    let svgWidth = +svg.attr('width');
    let svgHeight = +svg.attr('height');

    // Define a padding object
    // This will space out the trellis subplots
    let padding = { t: 20, r: 20, b: 60, l: 60 };

    let yearDomain
    let salaryDomain
    let yearScale
    let salaryScale
    let educationScale

    // tooltip 
    let mouse_coord = [0, 0]
    let toolTip = d3.tip()
        .attr("class", "d3-tip")
        .attr("offset", function (d) {
            console.log(mouse_coord)
            return mouse_coord
        })
        .html(function (d) {
            return "<h5>" + "Education: " + d.Education + "<br>"
                + "Occupation Class: " + d.Category + "<br>"
                + "Salary: " + d.Salary
            "</h5>";
        });
    svg.call(toolTip)
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
        svg.selectAll("circle")
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
    d3.csv('edu_occ.csv').then(function (dataset) {

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
                    svg.selectAll("circle")
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
            .attr("stroke", "black")
            .attr("r", 4)
            .attr("opacity", 0)
            .on("mouseover", function (d) {
                if (!toolTipLock || lockCategory == d["Category"]) {
                    toolTip.show(d)
                }
                if (!toolTipLock) {
                    let selectedCategory = d["Category"]
                    updateOccEdu(dataset, selectedCategory)
                }
            })
            .on("mouseout", function (d) {
                toolTip.hide(d)
                if (!toolTipLock) {

                    svg.selectAll("path")
                        .attr("stroke", "grey")
                        .attr("opacity", 0.1)
                    svg.selectAll("circle")
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
            .call(d3.axisBottom(yearScale))

        // y axis
        svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + padding.l + ',0)')
            .call(d3.axisLeft(salaryScale));

        //d3.legend(educationScale)

        // bottom x axis label
        svg.append("text")
            .attr("class", "axisLabel")
            .attr("transform", "translate(300,10)")
            .attr("dy", "0.3em")
            .text("Year");

        // left y axis label
        svg.append("text")
            .attr("class", "axisLabel")
            .attr("transform", "translate(20,370)rotate(270)")
            .attr("dy", "-0.2em")
            .text("Mean Salary ($)");




    });

}


    