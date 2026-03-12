export interface GetCountriesType {
  getCountries: ICountry[];
}

export interface GetStateByCountryIdType {
  getStateByCountryId: IStateOfCountry[];
}

export interface GetCityByStateIdType {
  getCityByStateId: ICityOfState[];
}

export interface GetStateByCountryIdVariablesType {
  countryId: string;
}

export interface GetCityByStateIdVariablesType {
  stateId: string;
}

export interface ICountry {
    country_id: string;
    name: string;
    latitude: string;
    longitude: string;
    phonecode: string;
}

export interface IStateOfCountry {
    country_id: string;
    name: string;
    id: string;
    country_code: string;
    type: string;
    iso2: string;
    latitude: string;
    longitude: string;
}

export interface ICityOfState {
    state_id: string;
    name: string;
    id: string;
    latitude: string;
    longitude: string;
}
