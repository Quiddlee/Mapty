// noinspection TypeScriptUMDGlobal

'use strict';

// prettier-ignore
const months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

class Workout {
  #date = new Date();
  #id = Date.now().toString().slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  };

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  };
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  };
}

////////////////////////////////////
// Application architecture

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
  }

  _getPosition() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      () => alert('Could not fetch location!')
    );
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [ latitude, longitude ];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapEvt) {
    this.#mapEvent = mapEvt;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  };

  _newWorkout(evt) {
    evt.preventDefault();

    const isValidInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const isPositiveNumbers = (...inputs) =>
      inputs.every(inp => inp > 0);

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    if (type === 'running') {
      const cadence = +inputCadence.value;

      if (
        !isValidInputs(distance, duration, cadence) ||
        !isPositiveNumbers(distance, duration, cadence)
      ) return alert('Inputs have to be positive numbers!');

      workout = new Running([ lat, lng ], distance, duration, cadence);
    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !isValidInputs(distance, duration, elevation) ||
        !isPositiveNumbers(distance, duration)
      ) return alert('Inputs have to be positive numbers!');

      workout = new Cycling([ lat, lng ], distance, duration, elevation);
    }

    this.#workouts.push(workout);

    this._renderWorkoutMarker(workout);

    console.log(workout);

    form.reset();
    form.classList.add('hidden');
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${ workout.type }-popup`
      }))
      .setPopupContent('workout')
      .openPopup();
  }
}

const app = new App();