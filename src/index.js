import './css/styles.css';
import debounce from 'lodash/debounce';
import { fetchCountries } from './js/fetchCountries';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const DEBOUNCE_DELAY = 300;

const searchBox = document.querySelector('#search-box');
const countryInfoBox = document.querySelector('.country-info');
const countryList = document.querySelector('.country-list');

const hide = (...els) => els.forEach(el => el.classList.add('is-hidden'));
const show = (...els) => els.forEach(el => el.classList.remove('is-hidden'));

const clearUI = () => {
  hide(countryInfoBox, countryList);
  countryList.innerHTML = '';
  countryInfoBox.innerHTML = '';
};

const countryCardTpl = ({ name, flags, capital, population, languages }) => `
  <div class="country__heading-wrapper">
    <img src="${flags.svg}"
      class="country__image country__image--big"
      alt="Flag of ${name.official}"
    >

    <b class="country__name">${name.official}</b>
  </div>

  <p class="country__capital"><b>Capital:</b> ${capital}</p>
  <p class="country__population"><b>Population:</b> ${population}</p>
  <p class="country__languages"><b>Languages:</b>
  ${Object.values(languages).join(', ')}</p>
`;

const countriesCardsTpl = ({ name, flags }) => `
<li class="country__item">
  <button data-name="${name.common}" class="country__btn js-country__btn">
    <img src="${flags.svg}" class="country__image" alt="Flag of ${name.common}">
    <span class="js-btn__text">${name.common}</span>
  </button>
</li>
`;

const makeMarkup = (array, template) => array.map(template).join('');

const renderUI = (array, el, template) =>
  el.insertAdjacentHTML('beforeend', makeMarkup(array, template));

const populateList = (countries, list, infoBox) => {
  clearUI();

  if (Object.keys(countries).length < 1 || !list) return;

  if (Object.keys(countries).length === 1 && list && infoBox) {
    renderUI(countries, infoBox, countryCardTpl);

    return show(infoBox);
  }

  renderUI(countries, list, countriesCardsTpl);

  show(list);
};

const isResponseBig = ({ length }) => {
  if (length > 10) {
    populateList({}, countryList, countryInfoBox);

    const infoMessage =
      'Too many matches found. Please enter a more specific name.';
    Notify.info(infoMessage);

    hide(countryInfoBox, countryList);
    return true;
  }
};

const onError = error => {
  console.log(error);

  const errorMessage = 'Oops, there is no country with that name';
  Notify.failure(errorMessage);

  clearUI();
};

const makeFetch = name => {
  return fetchCountries(name)
    .then(res => {
      if (isResponseBig(res)) return;
      populateList(res, countryList, countryInfoBox);
    })
    .catch(error => onError(error));
};

const onInputFetch = () => {
  const name = searchBox.value.trim();

  if (name.length >= 1) {
    return makeFetch(name);
  }

  clearUI();
};

searchBox.addEventListener('input', debounce(onInputFetch, DEBOUNCE_DELAY), {
  passive: true,
});

const onBtnClickFetch = ({ target }) => {
  const isBtnContent =
    target.nodeName !== 'BUTTON' && target.closest('.js-country__btn');
  const isBtn = target.classList.contains('js-country__btn');

  if (!isBtn && !isBtnContent) return;

  console.log(
    'target.nodeName ->',
    target.nodeName,
    'target.closest(.js-country__btn)->',
    target.closest('.js-country__btn'),
  );

  const search = isBtn
    ? target.dataset.name
    : target.closest('.js-country__btn').dataset.name;

  searchBox.value = search;
  makeFetch(search);

  clearUI();
};

countryList.addEventListener('click', onBtnClickFetch, {
  passive: true,
});
