import axios from 'axios';


console.log('Scripts');

const container = document.getElementById('container');
const loader = document.querySelector('.loader-wrapper');
console.log(container);
console.log("loader", loader);



const sectionLinks = document.querySelectorAll('.section-link');
const panelHeading = document.querySelector('.dynamic-panel-title');
console.log(panelHeading, sectionLinks);
Array.from(sectionLinks).forEach(link => link.addEventListener('click', function () {
  console.log(this.innerText);
  panelHeading.innerHTML = this.innerText;
  console.log(panelHeading.innerHTML);
}));

function showSectionText() {
  console.log(this);
  panelHeading.innerText = this.innerText;
}






//get user location
function getUserLocation(callback) {

  console.log("Get location");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      console.log(position);
      const key = 'AIzaSyAddwFzEu83xzv_3kQjwLOrK3d35bmiOKg';
      return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&sensor=false&key=${key}`).then(response => callback(response.data.results[0]['formatted_address']));
    });
  }
}

//submit form data
function submitData(JsonDataList) {
  loader.classList.add('show');
  console.log(JsonDataList);
  getUserLocation((location) => {
    console.log(location);

    const data = { responses: JsonDataList, location }

    axios
      .post('/response', data)
      .then(res => {
        console.log(res);
        loader.classList.remove('show');
        container.innerHTML = `<div class="jumbotron text-center">
                <h1 class="display-4">Thanks You!</h1>
                <p class="lead">Thanks for filling the survey.</p>
                <p class="lead">
                    <a class="btn btn-primary btn-success" href="/account" role="button">Fill Another Survey</a>
                    <a class="btn btn-primary btn-dark" href="/logout" role="button">Done</a>
                </p>
          </div>`;
      })
      .catch(error => {
        container.innerHTML = `<div class="jumbotron text-center">
                <h1 class="display-4">Oh noo!</h1>
                <p class="lead">Please check your internet connection and retry.</p>
                <p class="lead">
                    <a class="btn btn-primary btn-success" href="/account" role="button">Retry</a>
                    <a class="btn btn-primary btn-dark" href="/logout" role="button">Logout</a>
                </p>`
      });
  });
}


