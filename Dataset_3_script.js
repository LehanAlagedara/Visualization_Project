function init() {
    var w = 1000;
    var h = 500;
    var padding = 50;
    var margin = { top: 20, right: 20, bottom: 100, left: 80 }; // Margins around the chart area

    var tooltip = d3.select("#tooltip");

    d3.csv("Dataset_3_historicaldata.csv").then(function(data) {
        // Parse the data
        var dataset = [];
        var years = data.columns.slice(1); // Get the years from the columns

        data.forEach(function(d) {
            var ageGroup = d['Time Period'];
            years.forEach(function(year, i) {
                if (!dataset[i]) {
                    dataset[i] = { year: year }; // Initialize the dataset array for each year
                }
                dataset[i][ageGroup] = +d[year].replace(/,/g, ''); // Convert population values to numbers
            });
        });

        // Define the stack
        var stack = d3.stack()
            .keys(data.map(function(d) { 
                return d['Time Period'];  // define stack keys based on age groups
            }))
            .order(d3.stackOrderNone);

        var series = stack(dataset);

        // Set up scales
        var xScale = d3.scaleBand()
            .domain(dataset.map(function(d) {
                return d.year;  // Define the domain for the x scale based on year
            }))
            .range([0, w])
            .paddingInner(0.05);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, function(d) {
                return d3.sum(Object.values(d).slice(1));  //define the domain for the y scale based on total population
            })])
            .nice()
            .range([h, 0]);

        var colors = d3.scaleOrdinal(d3.schemeCategory10);  // Define the color scale

        var svg = d3.select("#chart")
                    .append("svg")
                    .attr("width", w + margin.left + margin.right)
                    .attr("height", h + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var groups = svg.selectAll("g")
            .data(series)
            .enter()
            .append("g")
            .style("fill", function(d, i) {
                return colors(i); 
            });

        // Add a rect for each data value
        groups.selectAll("rect")
            .data(function(d) { 
                return d;
            })
            .enter()
            .append("rect")
            .attr("x", function(d, i) { 
                return xScale(d.data.year); 
            })
            .attr("y", function(d) { 
                return yScale(d[1]); 
            })
            .attr("height", function(d) { 
                return yScale(d[0]) - yScale(d[1]);  // Set height based on population
            })
            .attr("width", xScale.bandwidth())
            .on("mouseover", function(event, d) {
                var ageGroup = this.parentNode.__data__.key;  // Get the age group
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);  // Show the tooltip
                tooltip.html("Age Group: " + ageGroup + "<br>" + "Year: " + d.data.year + "<br>" + "Population: " + (d[1] - d[0]).toLocaleString())
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            // Update tooltip position
            .on("mousemove", function(event, d) {
                tooltip.style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");  
            })
            // Hide the tooltip
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add axes
        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + h + ")")
            .call(xAxis)
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        var legend = svg.selectAll(".legend")
            .data(stack.keys())
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { 
                return "translate(" + i * 130 + "," + (h + 40) + ")"; 
            });

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d, i) {
                return colors(i);  // Assign colors to legend
            });

        // Add legend text
        legend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function(d) { 
                return d;
            });
    });
}

window.onload = init;
