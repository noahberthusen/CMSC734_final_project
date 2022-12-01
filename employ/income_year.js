// Global function called when select element is changed
{
	// function onCategoryChanged() {
	// 	var select = d3.select('#categorySelect').node();
	// 	// Get current value of select element
	// 	var category = select.options[select.selectedIndex].value;
	// 	// Update chart with the selected category of letters
	// 	updateChart(category);
	// }


	var category_dict_nate_income = {}
	//Avg COLA
	var cola = 24325.60
	var loan = 28950

	// recall that when data is loaded into memory, numbers are loaded as strings
	// this function helps convert numbers into string during data preprocessing
	function dataPreprocessor_edd(row) {
		if (!(row.Year in category_dict_nate_income)){
			category_dict_nate_income[row.Year] = {industry: {year: row.Year,
												  income: 0,
												  num: 0},
									   student: {year: row.Year,
												 income: [],
												 num: 0}
									  }
		}
		category_dict_nate_income[row.Year].industry.num += 1
		category_dict_nate_income[row.Year].industry.income += parseInt(row.Income)
		
		return row;
	}

	function printCommas(in_str) {
		temp_num = Number(Number(in_str).toFixed(2))
		return temp_num.toLocaleString("en-US")
	}

	var toolTip_industry = d3.tip()
		.attr("class", "d3-tip")

		.html(function(d) {
			//console.log(d)
			return "<h5>Industry: $"+printCommas(d.industry.income)+"</h5><h5>Student: $"+printCommas(d.student.income)+"</h5>";
			
		})

	var toolTip_student = d3.tip()
		.attr("class", "d3-tip")

		.html(function(d) {
			//console.log(d)
			return "<h5>Industry: $"+printCommas(d.industry.income)+"</h5><h5>Student: $"+printCommas(d.student.income)+"</h5>";
			
		})


	function dataPreprocessor_phd(row) {
		//console.log(row)
		
		if (!(row["Academic Year"].includes("-"))){
			return row
		}
		var year = row["Academic Year"].split("-")[0]
		// if (!(year in category_dict_nate_income)){
		// 	category_dict_nate_income[year] = {industry: {year: year,
		// 									  income: 0,
		// 									  num: 0},
		// 						   student: {year: year,
		// 									 income: 0,
		// 									 num: 0}
		// 						  }
		// }

		//console.log(year)

		if (!(year in category_dict_nate_income)){
			return row
		}
		category_dict_nate_income[year].student.num += 1
		var temp = parseInt(row["Overall Pay"].replace(/\$|,/g, ''))
		if (isNaN(temp)){
			return row
		}
		if(temp > 100000){

			return row
		}
		
		//console.log(temp)
		//category_dict_nate_income[year].student.income += parseInt(row["Overall Pay"].replace(/\$|,/g, ''))
		category_dict_nate_income[year].student.income.push(parseInt(row["Overall Pay"].replace(/\$|,/g, '')))
		
		return row;
	}

	let svg = d3//.select('svg');
		.select("#income_year")
		.select("svg");

	// Get layout parameters
	let svgWidth = +svg.attr('width');
	let svgHeight = +svg.attr('height');

	let padding = {t: 60, r: 40, b: 30, l: 100};

	// Compute chart dimensions
	let chartWidth = svgWidth - padding.l - padding.r;
	let chartHeight = svgHeight - padding.t - padding.b;

	// Compute the spacing for bar bands based on all 26 letters
	var barBand = chartHeight;
	var barHeight = barBand * 0.7;
	//var letters = [];



	// Create a group element for appending chart elements
	var chartG = svg.append('g')
		.attr('transform', 'translate('+[padding.l, padding.t]+')');

	// svg.append("g")
	// 	.append("text")
	// 	.attr("x", 80)
	// 	.attr("y", 20)
	// 	.text("Letter Frequency (%)")

	//d3.csv('edd_occ.csv', dataPreprocessor_edd).then(function(dataset) {
	d3.csv('./final_data/ssa_average_income.csv', dataPreprocessor_edd).then(function(dataset) {


		// Create global variables here and intialize the chart
		//console.log(dataset)
		data_nate_income = category_dict_nate_income;

		//console.log(data_nate_income);
		


		d3.csv('./final_data/phdstipends.csv', dataPreprocessor_phd).then(function(dataset2) {
			//console.log(data_nate_income)

			links = []

			svg.call(toolTip_industry);
			svg.call(toolTip_student);
			
			data_nate_income_keys = Object.keys(data_nate_income)
			for (var i = 0; i < data_nate_income_keys.length; i++) {
				//data[data_keys[i]].industry.income = data[data_keys[i]].industry.income/data[data_keys[i]].industry.num
				//console.log(data[data_keys[i]])
				index = Math.round(data_nate_income[data_nate_income_keys[i]].student.income.length/2)
				data_nate_income[data_nate_income_keys[i]].student.income.sort(function(a, b) {
					return a - b;
				});
				data_nate_income[data_nate_income_keys[i]].student.income = data_nate_income[data_nate_income_keys[i]].student.income[index] //data[data_keys[i]].student.num
				if (i > 0){
					links.push({"industry": {"y":[data_nate_income[data_nate_income_keys[i-1]].industry.income, data_nate_income[data_nate_income_keys[i]].industry.income],
											 "x": [data_nate_income_keys[i-1], data_nate_income_keys[i]]},
								
								"student": {"y": [data_nate_income[data_nate_income_keys[i-1]].student.income, data_nate_income[data_nate_income_keys[i]].student.income],
											"x": [data_nate_income_keys[i-1], data_nate_income_keys[i]]}
							   })
				}
			}
			
			//console.log(data_nate_income);
			
			barBand = barBand / data_nate_income_keys.length
			barHeight = barBand * 0.7;
			
			//console.log(data_nate_income);
			new_data_nate_income = Object.values(data_nate_income)
			//console.log(new_data_nate_income)


			var new_xheight = svgHeight - padding.b - 30

			var yDomain = [60000, 0]//[0.00074, 0.12702];

			var x = d3.scaleBand()
				.domain(data_nate_income_keys)
				.range([padding.l, svgWidth - padding.r]);
			
			svg.append("g")
				.attr("transform", "translate(-10," + new_xheight  + ")")
				.call(d3.axisBottom(x))
				.selectAll("text")
				.attr("transform", "translate(0,0)rotate(-45)")
				.style("text-anchor", "end");

			
			var y = d3.scaleLinear()
				.range([padding.t, svgHeight - padding.b -30])//[ 100, chartHeight ])
				.domain(yDomain)

			//.padding(1);


			svg.append("g")
				.call(d3.axisLeft(y))
				.attr("transform", "translate(80,0)")


			// Lines
			svg.selectAll("student_links")
				.data(links)
				.enter()
				.append("line")
				.attr("x1", function(d) { return x(d.student.x[0]); })
				.attr("x2", function(d) { return x(d.student.x[1]); })
				.attr("y1", function(d) { return y(d.student.y[0]); })
				.attr("y2", function(d) { return y(d.student.y[1]); })
				.attr("stroke", "black")

			svg.selectAll("industry_links")
				.data(links)
				.enter()
				.append("line")
				.attr("x1", function(d) { return x(d.industry.x[0]); })
				.attr("x2", function(d) { return x(d.industry.x[1]); })
				.attr("y1", function(d) { return y(d.industry.y[0]); })
				.attr("y2", function(d) { return y(d.industry.y[1]); })
				.attr("stroke", "black")

			// Circles
			svg.selectAll("student_circles")
				.data(new_data_nate_income)
				.enter()
				.append("circle")
				.attr("cx", function(d) { return x(d.student.year); })
				.attr("cy", function(d) { return y(d.student.income); })
				.attr("r", "6")
			
				.on("mouseover", toolTip_student.show)
				.on("mouseout", toolTip_student.hide)
				.style("fill", "blue")
				.attr("stroke", "black")


			svg.selectAll("industry_circles")
				.data(new_data_nate_income)
				.enter()
				.append("circle")
				.attr("cx", function(d) { return x(d.industry.year); })
				.attr("cy", function(d) { return y(d.industry.income); })
				.attr("r", "6")
				.style("fill", "red")
				.attr("stroke", "black")
				.on("mouseover", toolTip_industry.show)
				.on("mouseout", toolTip_industry.hide)


			y = d3.scalePoint()
				.domain(d3.range(new_data_nate_income.length))
				.rangeRound([padding.t, svgHeight - padding.b])
				.padding(1)
			

			svg.append("text")
				.attr("class", "title")
				.attr("x", svgWidth/2)
				.attr("y", padding.t - 30)
				.attr("text-anchor", "middle")
				.style("font-size", "20px")
				.style("text-decoration", "underline")
				.text("Industry vs Student Income")
			


			svg.append("text")
				.attr("class", "xlabel")
				.attr("x", svgWidth/2)
				.attr("y", svgHeight - 10)
				.attr("text-anchor", "middle")
				.style("font-size", "20px")
				.text("Year")

			svg.append("text")
				.attr("class", "ylabel")
			//.attr("x", 100)
			//.attr("y", 100)
				.attr("text-anchor", "middle")
				.style("font-size", "20px")
				.text("Income")
				.attr("transform", "translate("+padding.l/4+","+svgHeight/2+")rotate(-90)")
			//+padding.l/2+","+svgHeight/2+")rotate(-45)")



			svg.append("circle")
				.attr("cx",150)
				.attr("cy",130)
				.attr("r", "4")
				.style("fill", "red")
				.attr("stroke", "black")
			
			svg.append("text")
				.attr("x", 170)
				.attr("y", 130)
				.text("Industry")
				.style("font-size", "15px")
				.attr("alignment-baseline","middle")
			
			svg.append("circle")
				.attr("cx",150)
				.attr("cy",160)
				.attr("r", "4")
				.style("fill", "blue")
				.attr("stroke", "black")

			svg.append("text")
				.attr("x", 170)
				.attr("y", 160)
				.text("Graduate Student")
				.style("font-size", "15px")
				.attr("alignment-baseline","middle")
			
		})
		
	});

}
