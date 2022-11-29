{
    let svg = d3
        .select('#stipend')
        .select("svg");

    // Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
    let svgWidth = +svg.attr('width');
    let svgHeight = +svg.attr('height');

    // Define a padding object
    // This will space out the trellis subplots
    let padding = { t: 20, r: 20, b: 60, l: 80 };

    let yearDomain
    let payDomain
    let yearScale
    let payScale
    let educationScale

    // tooltip 
    let mouse_coord = [0, 0]
    let toolTip = d3.select(".tooltip4")
    toolTipLock = false

    function updateStipend() {
        // sorting is done to ensure the relevant data is moved to front
        // update lines

        svg.selectAll(".dPath")
            .sort(function (a, b) {
                return d3.ascending(a.key.slice(0, 3) == selectedJob,
                    b.key.slice(0, 3) == selectedJob)

            })
            .attr("opacity", function (ds) {
                if (ds != null) {
                    if (ds.key.slice(0, 3) == selectedJob) {
                        return 1
                    } else {
                        return 0
                    }
                }
            })

        // update points
        svg.selectAll("circle")
            .sort(function (a, b) {
                return d3.ascending(a.job == selectedJob,
                    b.job == selectedJob)
            })
            .attr("opacity", function (d) {
                if (d.job == selectedJob) {
                    return 1
                } else {
                    return 0
                }
                return
            })
    }

    

    // Historical Lifetime Income
    d3.csv('./edu_occ_and_tot_earn/edu_occ.csv').then(function (eduOccDataset) {
        d3.csv("./edu_occ_and_tot_earn/stipend.csv").then(function (stipendDataset) {

            let startYear = 2004
            let endYear = 2019

            // initial data processing
            eduOccDataset = eduOccDataset.filter(d => d["Year"] && +d["Year"] >= startYear && +d["Year"] <= endYear)
            stipendDataset = stipendDataset.filter(
                d => d["Academic Year"] && +(d["Academic Year"].slice(0, 4)) >= startYear &&
                    +(d["Academic Year"].slice(0, 4)) <= endYear)

            console.log(eduOccDataset)
            console.log(stipendDataset)

            eduOccDataset.forEach(function (d) {
                d["Salary"] = Math.round(d["Salary"])
                
            })

            // aggregate stipends
            let meanStipends = d3.nest()
                .key(function (d) {
                    if (d["Academic Year"]) {
                        let year = d["Academic Year"]
                        year = year.slice(0, 4)
                        year = +year
                        return year
                    } else {
                        return NaN
                    }
                })
                .rollup(v => Math.round(d3.median(v, function (d) {
                    if (d["Overall Pay"]) {
                        let numVal = d["Overall Pay"].slice(1)
                        numVal = numVal.replace(",", "")
                        numVal = +numVal
                        return numVal
                    } else {
                        return NaN
                    }
                })))
                .entries(stipendDataset)
            console.log(meanStipends)

            
            
            // combine into usable format

            nestedEduOccDataset = d3.nest()
                .key(function (d) {
                    return [d["Category"],d["Education"]]
                })
                .rollup(v => v.length)
                .entries(eduOccDataset)
           
            let dataset = []
            eduOccDataset.sort( (a,b) => d3.ascending( +a["Year"], +b["Year"] ) )
            eduOccDataset.forEach(function (d) {
                let job = d["Category"]
                let education = d["Education"]
                // filter out jobs without full data
                let val = nestedEduOccDataset.find(ds => ds.key == [job, education]).value
                if (val == endYear - startYear + 1) {
                    let year = +d["Year"]

                    let delay = 0
                    if (education == "Bachelor's") {
                        delay = 0
                    } else {
                        if (education == "Master's/Professional") {
                            delay = 2
                        } else {
                            delay = 6
                        }
                    }
                    let pay = 0
                    if (delay >= year - startYear) {
                        pay = (meanStipends.find(d => +d.key == year)).value
                    } else {
                        pay = d["Salary"]
                    }
                    let curr_d = {
                            "year": year,
                            "education": education,
                            "job": job,
                            "pay": pay
                    }
                    // cumulative earning
                    if (year > startYear) {
                        let prev_d = dataset.find(x => x.job == job && x.education == education && x.year == year - 1)
                        curr_d["c_pay"] = Math.round( 0.5 * ( pay + prev_d.pay ) + prev_d.c_pay )
                    } else {
                        curr_d["c_pay"] = 0
                    }
                    dataset.push(curr_d)

                }
                

            })



            // calculate cumulative pay
            let nestedDataset = d3.nest()
                .key(function (d) { return [d.job, d.education] })
                .entries(dataset)

            console.log(nestedDataset)
            // get unique jobs for dropdown
            let possibleJobs = dataset.map(function (d) {
                return d.job
            })

            possibleJobs = new Set(possibleJobs)
            possibleJobs = Array.from(possibleJobs)

            
            console.log(possibleJobs)
            selectedJob = possibleJobs[0]

            // select button
            d3.select("#jobSelectButton")
                .selectAll("optionList")
                .data(possibleJobs)
                .enter()
                .append("option")
                .text(d => occ_dict[d])
                .attr("value", d => d)

            d3.select("#jobSelectButton")
                .on("change", function (d) {
                    selectedJob = d3.select(this).property("value")
                    console.log(selectedJob)
                    updateStipend()
                })



            console.log(nestedDataset)
            // define x and y extent
            yearDomain = d3.extent(dataset, function (d) {
                return d.year
            });
            payDomain = d3.extent(dataset, function (d) {
                return d.c_pay
            });
            // create scales
            yearScale = d3.scaleLinear()
                .domain(yearDomain)
                .range([padding.l, svgWidth - padding.r])
            payScale = d3.scaleLinear()
                .domain(payDomain)
                .range([svgHeight - padding.t, padding.b])
            educationScale = d3.scaleOrdinal(d3.schemeCategory10)

            // initialize plots
            // line plot
            svg.selectAll(".line")
                .data(nestedDataset, function (d) {
                    return d.key
                })
                .enter()
                .append("path")
                .attr("class", "dPath")
                .attr("fill", "none")
                .attr("stroke", function (ds) {
                    if (ds != null) {
                        return educationScale(ds.key.slice(4,))
                    }
                })
                .attr("opacity", function (ds) {
                    if (ds != null) {
                        if (ds.key.slice(0, 3) == selectedJob) {
                            return 1
                        } else {
                            return 0
                        }
                    }
                })
                .attr("stroke-width", 10)
                .attr("d", function (ds) {
                    return d3.line()
                        .x(function (d) { return yearScale(d.year) })
                        .y(function (d) { return payScale(d.c_pay) })
                        (ds.values)
                })
            // points on line plot
            svg.selectAll()
                .data(dataset, function (d) {
                    return [d.job, d.education, d.year]
                })
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return yearScale(d.year)
                })
                .attr("cy", function (d) {
                    return payScale(d.c_pay)
                })
                .attr("stroke", "black")

                .attr("r", 4)
                .attr("fill", function (d) {
                    return educationScale(d.education)
                })
                .attr("opacity", function (d) {
                    if (d.job == selectedJob) {
                        return 1
                    } else {
                        return 0
                    }
                })
                .on("mouseover", function (d) {
                    console.log(d.job)
                    console.log(selectedJob)
                    console.log(selectedJob==d.job)
                    if (d.job == selectedJob) {
                        toolTip
                            .style('visibility', 'visible')
                            .style('top', d3.event.pageY + 10 + 'px')
                            .style('left', d3.event.pageX + 10 + 'px')
                            .html('Education: ' + d.education +
                                '<br />Occupation Class: ' + occ_dict[ d.job ] +
                                '<br />Total Earnings: $' + d.c_pay);
                    }
                    
                })
                .on("mouseout", function (d) {
                    toolTip.style('visibility', 'hidden');
                })
                
           updateStipend()

            // x axis
            svg.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(10,' + padding.t + ')')
                .call(d3.axisBottom(yearScale))

            // y axis
            svg.append('g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(' + padding.l + ',0)')
                .call(d3.axisLeft(payScale));

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
                .text("Total Earnings ($)");
        } )
    });

}


