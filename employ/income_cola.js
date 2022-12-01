// Global function called when select element is changed
{
	// function onCategoryChanged() {
	// 	var select = d3.select('#categorySelect').node();
	// 	// Get current value of select element
	// 	var category = select.options[select.selectedIndex].value;
	// 	// Update chart with the selected category of letters
	// 	updateChart(category);
	// }


	var category_dict = {}

	//median COLA from living wage
	var cola = 24325.60
	var loan = 28950


	function printCommas(in_str) {
		
		temp_num = Number(Number(in_str).toFixed(2))
		return temp_num.toLocaleString("en-US")
	}

	var toolTip_cola = d3.tip()
		.attr("class", "d3-tip")

		.html(function(d) {
			//console.log(d)
			var job = d.cat != "Student" ? occ_dict[d.cat] : "Graduate Student"
			return "<h5>"+job+": $"+printCommas(d.income)+"</h5>";
			
		})


	// recall that when data is loaded into memory, numbers are loaded as strings
	// this function helps convert numbers into string during data preprocessing
	function dataPreprocessor(row) {

		//console.log(row)
		if (!(row.Year == "2021")) {
			return row
		}
		if (!(row.Category in category_dict)){
			category_dict[row.Category] = {cat: row.Category,
										   income: 0,
										   num: 0}
		}
		category_dict[row.Category].num += 1
		category_dict[row.Category].income += parseInt(row.Salary)
		
		return row;
	}

	let svg = d3//.select('svg');
		.select("#income_cola")
		.select("svg");


	// Get layout parameters
	var svgWidth = +svg.attr('width');
	var svgHeight = +svg.attr('height');

	var padding = {t: 60, r: 40, b: 30, l: 40};

	// Compute chart dimensions
	var chartWidth = svgWidth - padding.l - padding.r;
	var chartHeight = svgHeight - padding.t - padding.b;

	// Compute the spacing for bar bands based on all 26 letters
	var barBand = chartHeight;
	var barHeight = barBand * 0.7;
	//var letters = [];

	var xDomain = [-30000, 50000]//[0.00074, 0.12702];

	var xScale = d3.scaleLinear()
		.domain(xDomain)
		.range([0, chartWidth]);

	// Create a group element for appending chart elements
	var chartG = svg.append('g')
		.attr('transform', 'translate('+[padding.l, padding.t]+')');

	// svg.append("g")
	// 	.append("text")
	// 	.attr("x", 80)
	// 	.attr("y", 20)
	// 	.text("Letter Frequency (%)")


	d3.csv('./final_data/edd_occ.csv', dataPreprocessor).then(function(dataset) {
		// Create global variables here and intialize the chart
		svg.call(toolTip_cola);
		
		//console.log(dataset)
		data = category_dict;

		data["Student"] = {cat: "Student",
						   income: 26000,
						   num: 1}
		//console.log(data);
		data_keys = Object.keys(data)
		for (var i = 0; i < data_keys.length; i++) {
			data[data_keys[i]].income = data[data_keys[i]].income/data[data_keys[i]].num - cola
		}

		barBand = barBand / data_keys.length
		barHeight = barBand * 0.7;
		
		//console.log(data);
		new_data = Object.values(data)
		//console.log(new_data)


		var new_xheight = svgHeight - padding.b - 30

		var x = d3.scaleLinear()
			.domain([-20000, 70000])
			.range([ padding.l, svgWidth - padding.r]);
		svg.append("g")
			.attr("transform", "translate(0," + new_xheight  + ")")
			.call(d3.axisBottom(x))
			.selectAll("text")
			.attr("transform", "translate(-10,0)rotate(-45)")
			.style("text-anchor", "end");


		var y = d3.scaleBand()
			.range([padding.t, svgHeight - padding.b-20])
			.domain(data_keys)
			.padding(1);



		svg.append("line")
			.attr("x1", x(loan))
			.attr("x2", x(loan))
			.attr("y1", padding.t + 10)
			.attr("y2", new_xheight)
			.style("stroke-width", 2)
			.style("stroke", "red")
			.style("stroke-dasharray", ("3, 3"))

		
		svg.selectAll("stick")
			.data(new_data)
			.enter()
			.append("line")
			.attr("x1", function(d) { return x(d.income); })
			.attr("x2", x(1000))
			.attr("y1", function(d) { return y(d.cat); })
			.attr("y2", function(d) { return y(d.cat); })
			.attr("stroke", "grey")


		svg.selectAll("lollipop")
			.data(new_data)
			.enter()
			.append("circle")
			.attr("cx", function(d) { return x(d.income); })
			.attr("cy", function(d) { return y(d.cat); })
			.attr("r", "6")
			.style("fill", function(d) { return d.income > 0 ? "blue" : "red"})
			.on("mouseover", toolTip_cola.show)
			.on("mouseout", toolTip_cola.hide)
			.attr("stroke", "black")


		y = d3.scalePoint()
			.domain(d3.range(new_data.length))
			.rangeRound([padding.t, svgHeight - padding.b-20])
			.padding(1)
		
		svg.append("g")
			.attr("font-size", 12)
			.selectAll("text")
			.data(new_data)
			.join("text")
			.attr("text-anchor", function(d) {return d.income < 0 ? "end" : "start"})
			.attr("x", function(d) {return x(d.income) + 10 * Math.sign(d.income)})
			.attr("y", function(d, i) {return y(i) + y.bandwidth() / 2})
			.attr("dy", "5")
			.text(function(d){return d.cat});

		svg.append("text")
			.attr("class", "title")
			.attr("x", svgWidth/2)
			.attr("y", padding.t - 30)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.style("text-decoration", "underline")
			.text("Income after Cost of Living")


		svg.append("text")
			.attr("class", "debt")
			.attr("x", x(loan))
			.attr("y", padding.t)
			.attr("text-anchor", "middle")
			.style("font-size", "12px")
			.text("Median Student Debt")

		svg.append("text")
			.attr("class", "debt")
			.attr("x", svgWidth/2)
			.attr("y", svgHeight-10)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.text("Income")
		
	});

}
