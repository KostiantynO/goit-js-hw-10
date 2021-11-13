function fetchCountries(name) {
  const baseURL = `https://restcountries.com/v3.1/name/${name}`;
  const params = `?fields=name,capital,population,flags,languages`;
  const url = `${baseURL}${params}`;

  return fetch(url).then(res => {
    if (!res.ok) throw new Error('404 not found');

    return res.json();
  });
}
export { fetchCountries };
