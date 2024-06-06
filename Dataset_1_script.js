function init() {
    var w = 1000;
    var h = 500;

    // Define the map projection
    var projection = d3.geoMercator()
        .center([0, 20]) // Center the map
        .translate([w / 2, h / 2])
        .scale(150); // Scale it

    var path = d3.geoPath()
        .projection(projection);

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("fill", "grey");

    // Tooltip
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Load the GeoJSON data
    d3.json("custom.geo.json").then(function (json) {
        var geoCountries = json.features.map(d => d.properties.name);
        console.log("GeoJSON Countries:", geoCountries);

        // Draw the map
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "lightgrey")
            .attr("stroke", "white");

        // Load the CSV data    
        d3.csv("Dataset_1_Population.csv").then(function (data) {
            var populationByCountryByYear = {};
            data.forEach(function (d) {
                var country = d.Country;
                populationByCountryByYear[country] = {
                    2018: +d["2018"],
                    2019: +d["2019"],
                    2020: +d["2020"],
                    2021: +d["2021"],
                    2022: +d["2022"]
                };
            });

            var csvCountries = data.map(d => d.Country);
            console.log("CSV Countries:", csvCountries);

            // Check for mismatches
            var missingCountries = csvCountries.filter(country => !geoCountries.includes(country));
            console.log("Missing Countries in GeoJSON:", missingCountries);

            // Function to update the chart based on the selected year            
            function update(year) {
                svg.selectAll(".bubble").remove();

                // Add bubbles to the map
                svg.selectAll(".bubble")
                    .data(json.features)
                    .enter()
                    .append("circle")
                    .attr("class", "bubble")
                    .attr("cx", function (d) {
                        var centroid = d3.geoCentroid(d);
                        return projection(centroid)[0];
                    })
                    .attr("cy", function (d) {
                        var centroid = d3.geoCentroid(d);
                        return projection(centroid)[1];
                    })
                    .attr("r", function (d) {
                        var country = d.properties.name;
                        var populationData = populationByCountryByYear[country];
                        if (!populationData) {
                            console.error("No population data for country:", country);
                            return 0;
                        }
                        var population = populationData[year];
                        if (!population) {
                            console.error("No population data for country:", country, "in year:", year);
                            return 0;
                        }
                        return Math.sqrt(population);  // Adjust bubble size based on population
                    })
                    .attr("fill", "steelblue")
                    .attr("fill-opacity", 0.6)
                    .attr("stroke", "black")
                    .attr("stroke-width", 0.5)
                    .on("mouseover", function (event, d) {
                        var country = d.properties.name;
                        var population = populationByCountryByYear[country][year];
                        tooltip.html("Year: " + year + "<br>" + "Country: " + country + "<br>" + "Population: " + population + " Million persons")
                            .style("opacity", 1);
                    })
                    .on("mousemove", function (event, d) {
                        tooltip.style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 10) + "px");
                    })
                    .on("mouseout", function (event, d) {
                        tooltip.style("opacity", 0);
                    });
            }

            // Event listener for year selection change
            var yearSelect = d3.select("#yearSelect");
            yearSelect.on("change", function() {
                var selectedYear = yearSelect.property("value");
                update(selectedYear);
            });

            // Initialize the chart with the default year (2018)
            update("2018");
        });
    });
}

window.onload = init;
