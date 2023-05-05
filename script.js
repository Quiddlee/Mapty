'use strict';

// prettier-ignore
const months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map;
let mapEvent;

const errorHandler = (message) => alert(message);

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function(position) {
      const { latitude, longitude } = position.coords;

      console.log(`https://www.google.co.uk/maps/@${ latitude },${ longitude }`);

      const coords = [ latitude, longitude ];
      map = L.map('map').setView(coords, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Handling clicks on map
      map.on('click', (mapEvt) => {
        mapEvent = mapEvt;
        form.classList.remove('hidden');
        inputDistance.focus();

      });
    }, errorHandler('Could not get your position'));
}

form.addEventListener('submit', (evt) => {
  evt.preventDefault();

  const { lat, lng } = mapEvent.latlng;
  L.marker([ lat, lng ])
    .addTo(map)
    .bindPopup(L.popup({
      maxWidth: 250,
      minWidth: 100,
      autoClose: false,
      closeOnClick: false,
      className: 'running-popup'
    }))
    .setPopupContent('Workout')
    .openPopup();

  form.reset();
  form.classList.add('hidden');
});

inputType.addEventListener('change', () => {
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});