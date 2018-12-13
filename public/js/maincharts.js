$(function() {
  //colors
  const violet = "#DF99CA",
    red = "#F0404C",
    green = "#7CF29C";

  //question mapper
  const pieQuestionMapper = {
    "2.5a": "Are these electricity costs affordable for my household",
    "2.5b": "Do you feel that these electricity cost are fair.",
    "2.1": "Are you using a pre-paid or post-paid meter",
    "3.3": "What times(s) of the day do failures tend to occur",
    "4.1": "Which of the following alternative power sources do you own"
  };

  //colors
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

  Object.keys(pieQuestionMapper).forEach((questionNo, i) => {
    $.ajax({
      url: "/api/question-by-count",
      data: {
        questionNo: questionNo
      },
      error: function() {
      },
      success: function(data) {
        const PIECHART = $(`#PIE${i + 1}`);
        $(`#PIE${i + 1}-heading`).text(pieQuestionMapper[questionNo]);

        const pieChartExample = new Chart(PIECHART, {
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

  const barQuestionMapper = {
    "2.3": "How much does the electricity company bill you, per month"
  };

  //bar chart from api
  let barChart1Data = null;
  let BARCHART1 = null;
  const filterBar1 = $("#filter-bar1");
  filterBar1.change(function() {
    if (BARCHART1) {
      BARCHART1.destroy();
    }
    drawBarCharrt(barChart1Data, this.value);
  });

  //draw bar chart with data from api

  function drawBarCharrt(data, interval) {
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
  $.ajax({
    url: "/api/bill-by-count",
    data: {
      questionNo: "2.3"
    },
    error: function() {},
    success: function(data) {
      barChart1Data = data;
      const value = $("#filter-bar1").val();
      drawBarCharrt(data, value);
    },
    type: "POST"
  });

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
});
