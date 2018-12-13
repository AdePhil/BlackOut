$(function() {
  let geocoder;
  let map;
  function initialize() {
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var mapOptions = {
      zoom: 13,
      center: latlng
    };
    map = new google.maps.Map(document.getElementById("MAP"), mapOptions);
  }

  function codeAddress(addresses, locationToResponseMap) {
    if (addresses.length === 0) return;
    let coords = [];
    addresses.forEach((address, i) => {
      geocoder.geocode({ address: address }, function(results, status) {
        if (status == "OK") {
          map.setCenter(results[0].geometry.location);
          var marker = new google.maps.Marker({
            map: map,
            title: `${locationToResponseMap[i]} responses at ${
              results[0].formatted_address
            }`,
            position: results[0].geometry.location
          });
          coords.push(results[0].geometry.location);
        } else {
          alert(
            "Geocode was not successful for the following reason: " + status
          );
        }
      });
    });
  }

  initialize();
  $.ajax({
    url: "/api/location-by-count",
    error: function() {
    },
    success: function(data) {
      const addresses = data.map(item => {
        return item._id;
      });
      const responses = data.map(item => item.count).map(parseFloat);
      codeAddress(addresses.slice(0, 11), responses);
    },
    type: "GET"
  });
});

//loop all the addresses and call a marker for each one
