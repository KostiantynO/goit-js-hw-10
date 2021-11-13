import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import debounce from 'lodash/debounce';
import { fetchCountries } from './js/fetchCountries';

const DEBOUNCE_DELAY = 300;

const searchBox = document.querySelector('#search-box');
const countryInfoBox = document.querySelector('.country-info');
const countryList = document.querySelector('.country-list');

countryList.style.listStyle = 'none';

searchBox.addEventListener(
  'input',
  debounce(onInput, DEBOUNCE_DELAY, { leading: false }),
);

function onInput() {
  const name = searchBox.value.trim();
  if (name.length >= 1) {
    fetchCountries(name)
      .then(res => {
        if (res.length > 10) {
          populateList({}, countryList, countryInfoBox);
          return Notify.info(
            'Too many matches found. Please enter a more specific name.',
          );
        }

        populateList(res, countryList, countryInfoBox);
      })

      .catch(error => {
        console.log(error);
        Notify.failure(`"Oops, there is no country with that name"`);
        countryList.innerHTML = '';
        countryInfoBox.innerHTML = '';
      });
  }
}

function populateList(countries, list, infoBox) {
  list.innerHTML = '';
  infoBox.innerHTML = '';

  if (Object.keys(countries).length < 1 || !list) {
    return;
  }

  if (Object.keys(countries).length === 1 && list && infoBox) {
    list.innerHTML = '';
    infoBox.innerHTML = '';

    const countryMarkup = countries
      .map(
        ({ name, flags, capital, population, languages }) =>
          `
  <img src="${
    flags.svg
  }" style="width: 25px; height: auto; margin-right: 5px;" alt="Flag of ${
            name.common
          }">
  <b class="country__name" style="font-size: 2rem;">${name.common}</b>

  <p class="country__capital"><b>Capital:</b> ${capital}</p>
  <p class="country__population"><b>Population:</b> ${population}</p>
  <p class="country__languages"><b>Languages:</b>
  ${Object.values(languages).join(', ')}</p>
      `,
      )
      .join('');
    infoBox.insertAdjacentHTML('beforeend', countryMarkup);

    return;
  }

  const markup = countries
    .map(
      ({ name, flags }) =>
        `
<li class="country__item">
  <img src="${flags.svg}"
  style="width: 25px; height: auto; margin-right: 5px;" alt="Flag of
  ${name.common}">
  <span class="country__name">${name.common}</span>
</li>
    `,
    )
    .join('');

  list.insertAdjacentHTML('beforeend', markup);
}
