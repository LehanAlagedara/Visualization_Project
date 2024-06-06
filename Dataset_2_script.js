// Function to show the chart corresponding to the selected year
function showChart(id) {
    // Remove the 'active' class from all charts
    d3.selectAll('.chart').classed('active', false);
    // Add the 'active' class to the selected chart
    d3.select(`#${id}`).classed('active', true);

    // Remove active class from all buttons
    document.querySelectorAll('.chart-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to the clicked button
    event.target.classList.add('active');
}

function init() {
    var w = 800;
    var h = 500;

    // Function to draw the chart for a specific year
    function drawChart(year, data, chartId) {
        var svg = d3.select(`#${chartId}`)
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        var margin = { top: 20, right: 20, bottom: 70, left: 70 },
            width = w - margin.left - margin.right,
            height = h - margin.top - margin.bottom;

        // Define the x and y scales
        var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1)
            .domain(data.map(d => d.Country));

        var y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, d => d[year])]);

        var g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Add x-axis to the chart
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        // Add y-axis to the chart
        g.append('g')
            .call(d3.axisLeft(y).ticks(10));

        // Tooltip
        var tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Add bars to the chart
        g.selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.Country))
            .attr('y', d => y(d[year]))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d[year]))
            .attr('fill', 'steelblue')
            .on('mouseover', function (event, d) {
                tooltip.html(`Country: ${d.Country}<br>Year: ${year}<br>Fertility Rate: ${d[year]}`)
                    .style("opacity", 1);
            })
            .on('mousemove', function (event, d) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on('mouseout', function (event, d) {
                tooltip.style("opacity", 0);
            });
    }

    // Load the CSV data
    d3.csv('Dataset_2_fertilityrates.csv').then(data => {
        console.log("Raw data:", data);

        // Parse the data
        data.forEach(d => {
            d['2017'] = +d['2017'];
            d['2018'] = +d['2018'];
            d['2019'] = +d['2019'];
            d['2020'] = +d['2020'];
            d['2021'] = +d['2021'];
        });

        console.log("Parsed data:", data);

        // Draw charts for each year
        drawChart('2017', data, 'chart2017');
        drawChart('2018', data, 'chart2018');
        drawChart('2019', data, 'chart2019');
        drawChart('2020', data, 'chart2020');
        drawChart('2021', data, 'chart2021');

        // Show the chart for the year 2017 by default
        showChart('chart2017');
    })
        .catch(error => {
        console.error("Error loading the CSV file:", error);
    });
}

window.onload = init;
