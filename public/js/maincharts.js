$(function() {

  //question mapper
  const pieQuestionMapper = {
    "2.5a": "Are these electricity costs affordable for my household",
    "2.5b": "Do you feel that these electricity cost are fair.",
    "2.1": "Are you using a pre-paid or post-paid meter",
    "3.3": "What times(s) of the day do failures tend to occur",
    "4.1": "Which of the following alternative power sources do you own"
  };

  const colors = [
    "green",
    "gold",
    "red",
    "black",
    "violet",
    "brown",
    "blue",
    "#3e95cd",
    "#8e5ea2",
    "#3cba9f",
    "#e8c3b9",
    "#c45850"
  ];


   // pie charts
   let PIECHARTCANVAS = {};
   function drawPieCharts(street, region) {
     const streetAvailable = street || {};
     const regionAvailable = region || {};

    Object.keys(pieQuestionMapper).forEach((questionNo, i) => {

      if(PIECHARTCANVAS[i]){
        PIECHARTCANVAS[i].destroy();
      }
      $.ajax({
        url: "/api/question-by-count",
        data: {
          questionNo: questionNo,
          street: streetAvailable,
          region: regionAvailable,
        },
        error: function() {},
        success: function(data) {
          const PIECHART = $(`#PIE${i + 1}`);
          $(`#PIE${i + 1}-heading`).text(pieQuestionMapper[questionNo]);

          PIECHARTCANVAS[i] = new Chart(PIECHART, {
            type: "pie",
            responsive: true,
            options: {
              tooltips: {
                callbacks: {
                  label: function(tooltipItem, data) {
                    let label = data.labels[tooltipItem.index] || "";

                    if (label) {
                      label += ": ";
                    }

                    const total = data.datasets[0].data.reduce(
                      (total, num) => total + num,
                      0
                    );
                    const number = data.datasets[0].data[tooltipItem.index];
                    label += Math.round(number * 100 / total) + "%";
                    return label;
                  }
                }
              },
              legend: {
                position: "bottom",
                labels: {
                  fontColor: "#444",
                  fontSize: 12
                }
              }
            },
            data: {
              labels: data.map(item => {
                if (item._id.trim() === "nothing") return "Don't know";
                return item._id;
              }),
              datasets: [
                {
                  data: data.map(item => item.count).map(parseFloat),
                  borderWidth: 0,
                  backgroundColor: colors,
                  hoverBackgroundColor: colors
                }
              ]
            }
          });
        },
        type: "POST"
      });
    });
   }

   drawPieCharts();


  const barQuestionMapper = {
    "2.3": "How much does the electricity company bill you, per month"
  };

  //bar chart from api
  let barChart1Data = null;
  let BARCHART1 = null;
  const filterBar1 = $("#filter-bar1");
  filterBar1.change(function() {
    drawBarChart(barChart1Data, this.value);
  });

  //draw bar chart with data from api

  function drawBarChart(data, interval) {
    if (BARCHART1) {
      BARCHART1.destroy();
    }

    if (!data) return;
    const [labels, counts] = barChartRange(data, interval, 10);
    const BARCHART = $(`#BAR1`);
    $(`#BAR1-heading`).text("Electricity Bill");

    BARCHART1 = new Chart(BARCHART, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Bill per houseold",
            backgroundColor: colors,
            data: counts
          }
        ]
      },
      options: {
        legend: { display: false },
        title: {
          display: true,
          text: "Amount charged by electricity company per month in naira",
          fontSize: 14
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              let label = data.labels[tooltipItem.index] || "";

              if (label) {
                label += ": ";
              }

              const total = data.datasets[0].data.reduce(
                (total, num) => total + num,
                0
              );
              const number = data.datasets[0].data[tooltipItem.index];
              label += Math.round(number * 100 / total) + "%";
              return label;
            }
          }
        }
      }
    });
  }
  //bar chart
function barChart(questionNo, street, region) {
     const questionNoAvailable = questionNo || "2.3";
     const streetAvailable = street || {};
     const regionAvailable = region || {};
  $.ajax({
    url: "/api/bill-by-count",
    data: {
      questionNo: questionNoAvailable,
      street: streetAvailable,
      region: regionAvailable,
    },
    error: function() {},
    success: function(data) {
      barChart1Data = data;
      const value = $("#filter-bar1").val();
      drawBarChart(data, value);
    },
    type: "POST"
  });
}
  barChart();

  //split barchart data into range
  function barChartRange(barChartData, distance, count) {
    const array = Array(count)
      .fill(0)
      .map((num, i) => (i + 1) * distance);
    let countArray = Array.from(Array(count), () => 0);
    const total = barChartData.reduce((total, item) => item.count + total, 0);
    let countTotal = 0;

    for (let k = 0; k < barChartData.length; k++) {
      if (parseFloat(barChartData[k]._id) <= array[0]) {
        countArray[0] += barChartData[k].count;
        countTotal += barChartData[k].count;
      } else {
        for (let j = 1; j < array.length; j++) {
          if (parseFloat(barChartData[k]._id) <= array[j]) {
            countArray[j] += barChartData[k].count;
            countTotal += barChartData[k].count;
            break;
          }
        }
      }
    }

    let label = array.map((item, i) => {
      if (i == 0) return `below ${item}`;
      return `${array[i - 1]} - ${array[i]}`;
    });

    label = [...label, `above ${array[array.length - 1]}`];
    countArray = [...countArray, total - countTotal];

    return [label, countArray];
  }

  //Line chart
  function drawLineChart() {
  $.ajax({
    url: "/api/location-by-count",
    error: function() {},
    success: function(data) {
      const BARCHART = $(`#BAR2`);
      $(`#BAR2-heading`).text("Survey Locations");

      const barChart = new Chart(BARCHART, {
        type: "line",
        responsive: true,
        options: {
          legend: { display: false },
          title: {
            display: true,
            text: "The locations in which the survey was filled",
            fontSize: 14
          }
        },
        data: {
          labels: data.map(item => {
            if (item._id.trim() === "nothing") return "Don't know";
            return item._id;
          }),
          datasets: [
            {
              data: data.map(item => item.count).map(parseFloat),
              label: "Survey Locations",
              fill: false,
              borderColor: "red",
              backgroundColor: "transparent"
            }
          ]
        }
      });
    },
    type: "GET"
  });

  }

  drawLineChart();

  //filter by street and region
  let streetSelect = $('#street');
  const regionSelect = $('#region');
  streetSelect.on('change', function() {
    const street = this.value;
    const region =  `${street.split(",")[1]}`.trim();

    drawPieCharts({street},{});
    barChart("2.3", {street});
    regionSelect.val(region);
  });

  //search by region alone
  const regionCheck = $('#region-only');
  regionCheck.on('change', function() {
    if(this.checked){
      streetSelect.val('');
      streetSelect.attr('disabled', true);
    }else{
      streetSelect.attr('disabled', false);
    }
  });

  //filter by region
  regionSelect.on('change', function(){
      if(regionCheck.prop('checked')){
        const region = this.value;
        drawPieCharts({}, {region});
        barChart("2.3", {}, {region});
        return;
      }
      fetchAllStreetsInARegion(this.value);
  });

  function fetchAllStreetsInARegion(region) {
    if(!region) return;
    const config = { ALLOWED_TAGS: ['option'], KEEP_CONTENT: true };
    streetSelect.html(DOMPurify.sanitize(`<option selected>Please Wait</option>`, config));

    $.ajax({
      url: "/api/streets-by-region",
      data:{
        region: region
      },
      error: function() {},
      type: "POST",
      success: function(data) {
        const streetOptions = data[0].regionStreets.map(option => {
          return `
            <option value='${option}'>${option}</option>
          `
        }).join('');
        streetSelect.html(DOMPurify.sanitize(streetOptions, config));
        const street = data[0].regionStreets[0];
        drawPieCharts({street},{});
        barChart("2.3", {street});
      }
    });
  }
});




