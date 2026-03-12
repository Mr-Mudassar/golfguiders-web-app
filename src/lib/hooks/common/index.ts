import React from 'react';

import { useLazyQuery } from '@apollo/client/react';
import { GET_ALL_CITY, GET_ALL_COUNTRIES, GET_ALL_STATE } from './_query';
import type {
  GetCityByStateIdType,
  GetCityByStateIdVariablesType,
  GetCountriesType,
  GetStateByCountryIdType,
  GetStateByCountryIdVariablesType,
  ICityOfState,
  ICountry,
  IStateOfCountry,
} from './_interface';

export const useFetchCountryStatesCities = (
  country_id: string,
  state_id: string
): {
  loading: boolean;
  countries: ICountry[];
  states: IStateOfCountry[];
  cities: ICityOfState[];
} => {

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [countries, setCountries] = React.useState<ICountry[]>([]);
  const [states, setStates] = React.useState<IStateOfCountry[]>([]);
  const [cities, setCities] = React.useState<ICityOfState[]>([]);

  const [handleCountries] = useLazyQuery<GetCountriesType>(GET_ALL_COUNTRIES);
  const [handleState] = useLazyQuery<
    GetStateByCountryIdType,
    GetStateByCountryIdVariablesType
  >(GET_ALL_STATE);
  const [handleCity] = useLazyQuery<
    GetCityByStateIdType,
    GetCityByStateIdVariablesType
  >(GET_ALL_CITY);

  React.useEffect(() => {
    getCountries();
  }, [countries]);

  React.useEffect(() => {
    if (country_id) {
      getStates(country_id);
    }
  }, [country_id]);

  React.useEffect(() => {
    if (state_id) {
      getCities(state_id);
    }
  }, [state_id]);

  async function getCountries(): Promise<void> {
    try {
      setIsLoading(true);
      const response = await handleCountries();
      if ((response?.data?.getCountries?.length ?? 0) > 0) {
        setCountries(response?.data?.getCountries ?? []);
        setIsLoading(false);
      } else {
        setCountries([]);
        setIsLoading(false);
      }
    } catch {
      setCountries([]);
      setIsLoading(false);
    }
  }

  async function getStates(country_id: string): Promise<void> {
    try {
      const response = await handleState({
        variables: {
          countryId: country_id,
        },
      });

      if ((response?.data?.getStateByCountryId?.length ?? 0) > 0) {
        setStates(response?.data?.getStateByCountryId ?? []);
      } else {
        setStates([]);
      }
    } catch {
      setStates([]);
    }
  }

  async function getCities(state_id: string): Promise<void> {
    try {
      const response = await handleCity({
        variables: {
          stateId: state_id,
        },
      });

      if ((response?.data?.getCityByStateId?.length ?? 0) > 0) {
        setCities(response?.data?.getCityByStateId ?? []);
      } else {
        setCities([]);
      }
    } catch {
      setCities([]);
    }

  }

  return React.useMemo(() => {
    return { states, loading: isLoading, cities, countries };
  }, [states, cities, isLoading, countries]);
};