//Uncaught TypeError: Cannot read properties of undefined (reading 'startAngle')
{
	//actually half of new larger one
	var svg_height = 600
	var svg_width = 680
	var radius = svg_height / 3//200


	var start = 0
	var end = 0

	var arc = d3.arc()
		.innerRadius(0)
		.outerRadius(radius);

	function printCommas(in_str) {
		return Number(in_str).toLocaleString("en-US")
	}

	var toolTip = d3.tip()
		.attr("class", "d3-tip")

		.html(function(d) {
			//console.log(d)
			//console.log(this)
			
			//return "<h5>"+d.data.value['Unemployment Rate']+"</h5>";

			start = d.startAngle
			end = d.endAngle
			
			return "<h5>"+d.data.key+"</h5><table><thead><tr><td colspan='2'>Percent of Field</td><td>Employed</td><td>Unemployed</td><td>Unemployment Rate</td></tr></thead>"
				+ "<tbody><tr><td colspan='2'>"+d.data.value['Percent of Field']+"</td><td>"+printCommas(d.data.value['Employed'])+"</td><td>"+printCommas(d.data.value['Unemployed'])+"</td><td>"+d.data.value["Unemployment Rate"]+"</td></tr></tbody></table>"
			
		})

	var toolTip2 = d3.tip()
		.attr("class", "d3-tip")

		.html(function(d) {
			//console.log(d)
			//console.log(this)
			
			return "<h5>"+d.value+"</h5>";
			
			//start = d.startAngle
			//end = d.endAngle
			
			//return "<h5>"+d.data.key+"</h5><table><thead><tr><td colspan='2'>Percent of Field</td><td>Employed</td><td>Unemployed</td><td>Unemployment Rate</td></tr></thead>"
			//    + "<tbody><tr><td colspan='2'>"+d.data.value['Percent of Field']+"</td><td>"+printCommas(d.data.value['Employed'])+"</td><td>"+printCommas(d.data.value['Unemployed'])+"</td><td>"+d.data.value["Unemployment Rate"]+"</td></tr></tbody></table>"
			
		})

	//.attr("transform", function(d) {
	//var temp = arc.centroid(d)
	//console.log(end)
	//	console.log(this)

	//	test = d3.arc()
	//		.innerRadius(0)
	//		.outerRadius(radius)
	//		.startAngle(start)
	//		.endAngle(end)
	//temp = [0,0]
	//	var temp = arc.centroid(test)
	//	temp[0] = temp[0] - 40
	//	return "translate(" + temp + ")"; 
	//})


	//});

	//svg width="680" height="600" style="border: 1px solid #777;">


	var init_field = "General Agriculture"


	// Global function called when select element is changed
	function onCategoryChangedPie() {
		var select = d3.select('#fieldSelector').node();
		// Get current value of select element
		field = select.options[select.selectedIndex].value;
		//console.log("SEL CATEGORY: " + field)
		updateChart(field);
	}



	//d3.csv('unemployment_data_clean2.csv').then(function(dataset) {
	d3.json('./employ/unemployment_data_clean2.json').then(function(local_dataset) {
		//dataset.length = 1
		dataset = local_dataset
		console.log(dataset)
		
		//var data = {Undergraduate : Number(dataset[0]["Undergrad_Employed"]) + Number(dataset[0]["Undergrad_Unemployed"]), Graduate : Number(dataset[0]["Graduate_Employed"]) + Number(dataset[0]["Graduate_Unemployed"])}
		//var data = [Number(dataset[0]["Undergrad_Employed"]) + Number(dataset[0]["Undergrad_Unemployed"]), Number(dataset[0]["Graduate_Employed"]) + Number(dataset[0]["Graduate_Unemployed"])]

		
		
		//data = dataset
		//
		updateChart(init_field)
	});


	function updateChart(field) {

		
		
		
		data = {Undergraduate : {Total : dataset[field].Undergraduate_Total,
								 Employed : dataset[field].Undergraduate_Employed,
								 Unemployed : dataset[field].Undergraduate_Unemployed,
								 "Unemployment Rate": dataset[field].Undergraduate_Unemployment_Rate,
								 "Percent of Field": dataset[field].Undergraduate_Percent_Field},

				"Graduate Non-Doctorate": {Total: dataset[field]["Graduate_Non-Doctorate_Total"],
										   Employed : dataset[field]["Graduate_Non-Doctorate_Employed"],
										   Unemployed : dataset[field]["Graduate_Non-Doctorate_Unemployed"],
										   "Unemployment Rate": dataset[field]["Graduate_Non-Doctorate_Unemployment_Rate"],
										   "Percent of Field": dataset[field]["Graduate_Non-Doctorate_Percent_Field"]},


				"Graduate Doctorate": {Total: dataset[field].Graduate_Doctorate_Total,
			 						   Employed : dataset[field].Graduate_Doctorate_Employed,
			 						   Unemployed : dataset[field].Graduate_Doctorate_Unemployed,
			 						   "Unemployment Rate": dataset[field].Graduate_Doctorate_Unemployment_Rate,
									   "Percent of Field": dataset[field]["Graduate_Doctorate_Percent_Field"]}

			   }

		d3.select("#pie")
			.selectAll("text")
			.remove()

		d3.select("#pie")
			.selectAll("line")
			.remove()
		
		//console.log(data)
		
		var color = d3.scaleOrdinal()
			.domain(data)
			.range(d3.schemeSet2);
		
		// Selecting SVG using d3.select()
		var svg = d3
			.select("#pie")
			.select("svg");
		svg.call(toolTip);
		svg.call(toolTip2);


		svg.selectAll("labelColor")
			.remove()
		svg.selectAll("g")
			.remove()
		

		
		let g = svg.append("g")
			.attr("transform", "translate(" + svg_width / 2 + ","+svg_height / 2 + ")");


		var pie = d3.pie()
			.value(function(d) {return d.value.Total});

		


		var prep_data = pie(d3.entries(data))

		//console.log(prep_data)
		var arcs = g.selectAll("arc")
			.data(prep_data) 
			.enter()
			.append("g")

			.on("mouseover", toolTip.show)
			.on("mouseout", toolTip.hide)
		
		





		arcs.append("path")
			.attr("fill", function(d){ return(color(d.data.key)) })
			.attr("stroke", "black")
			.attr("d", arc);


		svg.append("text")
			.attr("class", "title")
			.attr("x", svg_width/2)
			.attr("y", svg_height/12)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.style("text-decoration", "underline")
			.text("Employment Data: " + field)

		svg.selectAll("labelColor")
			.data(prep_data)
			.enter()
			.append("circle")
			.attr("cx", 30)
			.attr("cy", function(d,i) {return svg_height - 60 - i *30})
			.attr("r", 5)
			.style("fill", function(d){ return(color(d.data.key)) })

		svg.selectAll("labelText")
			.data(prep_data)
			.enter()
			.append("text")
			.text(function(d) { return d.data.key })
			.attr("x", 45)
			.attr("y", function(d,i) {return svg_height - 55 - i *30})

		data_keys = Object.keys(data)
		console.log(data_keys)
		bar_data = []
		vals = []
		for (var i = 0; i < data_keys.length; i++) {
			bar_data.push({key: data_keys[i],
						   value: parseFloat(data[data_keys[i]]["Unemployment Rate"])})
			vals.push(parseFloat(data[data_keys[i]]["Unemployment Rate"]))
		}

		console.log(bar_data)

		var total_unemployment = 3.6
		console.log(Math.max.apply(Math, vals))
		actual_max = Math.max(Math.max.apply(Math, vals), total_unemployment)

		var x = d3.scaleBand()
			.range([ 100, svg_width - 50])
			.domain(data_keys)
			.padding(0.2);
		svg.append("g")
			.attr("transform", "translate("+ 0 + "," + (svg_height*2 -130) + ")")
			.call(d3.axisBottom(x))
			.selectAll("text")
			.attr("transform", "translate(-10,0)rotate(-45)")
			.style("text-anchor", "end");

		// Add Y axis
		var y = d3.scaleLinear()
		//.domain([0, Math.max.apply(Math, vals)])
			.domain([0, actual_max+0.5])//Math.max.apply(Math, vals)])
			.range([svg_height*2-150, svg_height]);
		//svg_height/2 + 100, svg_height*2-100]);
		
		svg.append("g")
			.call(d3.axisLeft(y))
			.attr("transform", "translate(80,0)")

		

		

		

		console.log (y(Math.max.apply(Math, vals)))
		
		
		svg.selectAll("bar_chart")
			.data(bar_data)
			.enter()
			.append("rect")
			.attr("x", function(d) { return x(d.key); })
			.attr("y", function(d) { return y(d.value); })//svg_height*2-200)//
			.attr("width", x.bandwidth())
			.attr("height", function(d) { return  svg_height*2 -150 - y(d.value); })
			.attr("fill", function(d){ return(color(d.key))})

			.on("mouseover", toolTip2.show)
			.on("mouseout", toolTip2.hide)


		svg.append("text")
			.attr("class", "ylabel")
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.text("Percent Unemployment")
			.attr("transform", "translate("+ 30 +","+(svg_height*6/4-75)+")rotate(-90)")

		svg.append("text")
			.attr("class", "xlabel")
			.attr("x", svg_width/2)
			.attr("y", svg_height * 2 - 15)
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.text("Education Level")

		svg.append("line")
	 		.attr("x1", 100)
	 		.attr("x2", svg_width - 50)
	 		.attr("y1", y(total_unemployment))
	 		.attr("y2", y(total_unemployment))
	 		.style("stroke-width", 2)
	 		.style("stroke", "red")
	 		.style("stroke-dasharray", ("3, 3"))

		svg.append("text")
			.attr("class", "ylabel")
			.attr("text-anchor", "middle")
			.style("font-size", "20px")
			.text("National Average")
			.attr("transform", "translate("+(svg_width-25)+"," + y(total_unemployment)+")rotate(-270)")
		
	};
}
