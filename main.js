var width = 800;
var height = 800;

d3.csv("traffic.csv", function (csv) {

  var minDeaths = Number.POSITIVE_INFINITY;
  var maxDeaths = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < csv.length; ++i) {
    csv[i].Year = Number(csv[i].Year)
    csv[i].Population = Number(csv[i].Population);
    csv[i].DNumber = Number(csv[i].DNumber);
    csv[i].Rate = Number(csv[i].Rate);
    if (csv[i].DNumber < minDeaths) minDeaths = csv[i].DNumber;
    if (csv[i].DNumber > maxDeaths) maxDeaths = csv[i].DNumber;
  }

  var data = csv;
  var cutoff = 0;

  //Cutoff
  var main = document.getElementById('chart5');
  d3.select(main)
    .append('p')
    .append('button')
    .style("border", "1px solid black")
    .text('Filter Data')
    .on('click', function () {
      cutoff = Number(document.getElementById('value-simple').innerHTML);
      console.log(cutoff);
      updateChart(cutoff);
    });

  var yearExtent = d3.extent(csv, function (row) {
    return row.Year;
  });
  var rateExtent = d3.extent(csv, function (row) {
    return row.Rate;
  });

  // Axis setup
  var xScale = d3.scaleLinear().domain(yearExtent).range([50, 770]);
  var yScale = d3.scaleLinear().domain(rateExtent).range([770, 30]);

  var xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format("d"));
  var yAxis = d3.axisLeft().scale(yScale);

  //Legend
  d3.select("#AgeGroup1").append('circle').attr('r', '5px').attr('opacity', 0.6)
    .attr('transform', 'translate(5,7)')
    .attr('class', 'age-group-1');
  d3.select("#AgeGroup2").append('circle').attr('r', '5px').attr('opacity', 0.6)
    .attr('transform', 'translate(5,7)')
    .attr('class', 'age-group-2');
  d3.select("#AgeGroup3").append('circle').attr('r', '5px').attr('opacity', 0.6)
    .attr('transform', 'translate(5,7)')
    .attr('class', 'age-group-3');
  d3.select("#AgeGroup4").append('circle').attr('r', '5px').attr('opacity', 0.6)
    .attr('transform', 'translate(5,7)')
    .attr('class', 'age-group-4');
  d3.select("#AgeGroup5").append('circle').attr('r', '5px').attr('opacity', 0.6)
    .attr('transform', 'translate(5,7)')
    .attr('class', 'age-group-5');

  //Create SVGs for charts
  var chart1 = d3
    .select("#chart1")
    .append("svg:svg")
    .attr("id", "svg1")
    .attr("width", width)
    .attr("height", height);

  //Labels for Chart
  var title1 = d3
    .select("#svg1")
    .append("text")
    .attr("x", width / 2)
    .attr("y", 12)
    .attr("font-size", "12px")
    .attr("transform", "translate(-150,0)")
    .text("Vehicle Crash Death Rate per 100,000 People by Age Group, 1975-2020");

  //Labels for Axes
  var yearLabel = d3
    .select("#svg1")
    .append("text")
    .attr("x", width / 2)
    .attr("y", height)
    .attr("font-size", "12px")
    .text("Year");

  var deathLabel = d3
    .select("#svg1")
    .append("text")
    .attr("x", -width / 2)
    .attr("y", 20)
    .attr("font-size", "12px")
    .attr("text-anchor", "end")
    .attr("transform", "translate(0, -50)rotate(-90)")
    .text("Death Rate per 100,000 People");

  /******************************************
  	
    Create Circles for Each Scatterplot

   ******************************************/

  chart1
    .append("g")
    .attr("transform", "translate(0," + (width - 30) + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", width - 16)
    .attr("y", -6)
    .style("text-anchor", "end");

  chart1
    .append("g")
    .attr("transform", "translate(50, 0)")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end");

  function whichAgeClass(val) {
    if (val === '<13 years') {
      return 'age-group-1';
    } else if (val === '13-19 years') {
      return 'age-group-2';
    } else if (val === '20-34 years') {
      return 'age-group-3';
    } else if (val === '35-69 years') {
      return 'age-group-4';
    } else {
      return 'age-group-5';
    }
  }

  var Tooltip = d3.select("#chart6")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  // Tooltip / Hover behavior
  var mouseover = function (d) {
    Tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
  var mousemove = function (d) {
    Tooltip
      .html("<p class='tooltip'>" + "Year: " + d.Year + "<br><br>" + "Age: " + d.Age + "<br><br>" + "Population: " + d.Population + "<br><br>" + "Deaths: " + d.DNumber + "<br><br>" + "Rate per 100,000 People: " + d.Rate)
      .style("left", (d3.mouse(this)[0] + 70) + "px")
      .style("top", (d3.mouse(this)[1]) + "px");
  }
  var mouseleave = function (d) {
    Tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }

  // Brushing
  var brush = d3.brush()
    .extent([[0, 0], [width, height]])
    .on("start", brushstart)
    .on("brush", highlightBrushedCircles)
    .on("end", displayValues);

  //IMPORTANT: Call brush before appending circles so tooltip & brush can coexist.
  chart1.append("g").call(brush);

  function updateChart(cutoff) {
    data = csv.filter(d => d['DNumber'] >= cutoff);
    console.log(data);

    let item = chart1.selectAll('.circles').data(data, d => [d.Year, d.Age]);

    item.exit().remove();

    var itemEnter = item.enter().append('g').attr('class', 'circles');
    // .attr('transform', function (d) {
    //   return 'translate(' + xScale(d.Year) + ',' + yScale(d.DNumber) + ')';
    // });

    itemEnter.append('circle').attr('r', '5px').attr('opacity', 0.6)
      .attr('class', function (d) {
        return whichAgeClass(d.Age);
      }).on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseleave);

    itemEnter.merge(item)
      .attr('transform', function (d) {
        return 'translate(' + xScale(d.Year) + ',' + yScale(d.Rate) + ')';
      });
  }

  updateChart(cutoff);

  var sliderSimple = d3
    .sliderBottom()
    .min(minDeaths)
    .max(maxDeaths)
    .width(300)
    .ticks(5)
    .default(5)
    .on('onchange', val => {
      d3.select('p#value-simple').text(d3.format('.1f')(val));
    });

  var gSimple = d3
    .select('div#slider-simple')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

  gSimple.call(sliderSimple);

  d3.select('p#value-simple').text(d3.format('.1f')(sliderSimple.value()));

  function brushstart() {
    chart1.selectAll("circle").attr("class", "non_brushed");
    d3.select("#brush").call(brush.move, null); //using `.call()` to call the brush function on each elements
  }

  function highlightBrushedCircles() {

    // Get the extent or bounding box of the brush event, this is a 2x2 array
    var e = d3.event.selection;
    if (e) {
      //Revert circles to initial style
      chart1.selectAll('circle').attr("class", "non_brushed");

      //Select the instance of brush selection (access coordinates of the selection area)
      var coords = d3.brushSelection(this);

      var selected = chart1.selectAll('circle').filter(function (d) {
        return insideBrush(coords, xScale(d.Year), yScale(d.Rate));
      }).attr("class", function (d) {
        return whichAgeClass(d.Age);
      });

      if (selected['_groups'][0].length >= 1) {
        clearInfo();
        updateInfo(selected.data());
      } else {
        clearInfo();
      }
    }
  }

  function displayValues() {
    // If there is no longer an extent or bounding box then the brush has been removed
    if (!d3.event.selection) {
      // Bring back all non brushed circle elements to original color gradient
      clearInfo();
      d3.selectAll(".non_brushed").attr("class", function (d) {
        return whichAgeClass(d.Age);
      });

    }
  }

  function insideBrush(brush_coords, cx, cy) {
    var x0 = brush_coords[0][0],
      x1 = brush_coords[1][0],
      y0 = brush_coords[0][1],
      y1 = brush_coords[1][1];
    return (x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1);
  }

  function clearInfo() {
    document.getElementById("myYear").textContent = "";
    document.getElementById("myPopulation").textContent = "";
    document.getElementById("myDeaths").textContent = "";
    document.getElementById("myRate").textContent = "";
  }

  function updateInfo(data) {
    let numElements = data.length;
    let sumYear = 0;
    let sumPop = 0;
    let sumNum = 0;
    let sumRate = 0;
    for (let i = 0; i < numElements; i++) {
      sumYear += data[i].Year;
      sumPop += data[i].Population;
      sumNum += data[i].DNumber;
      sumRate += data[i].Rate;
    }
    document.getElementById("myYear").textContent = (sumYear / numElements).toFixed(2);
    document.getElementById("myPopulation").textContent = (sumPop / numElements).toFixed(2);
    document.getElementById("myDeaths").textContent = (sumNum / numElements).toFixed(2);
    document.getElementById("myRate").textContent = (sumRate / numElements).toFixed(2);
  }

});