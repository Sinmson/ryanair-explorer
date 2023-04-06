import axios from 'axios';
import { ActiveAirportsResponse } from '../types/ryanair/index';
import {
  LanguageCode,
  RoundTripFaresRequestOptions,
  RoundTripFaresResponse,
} from '../types/ryanair';

const api = axios.create({ baseURL: 'https://www.ryanair.com' });

export async function getRoundTripFares(options: RoundTripFaresRequestOptions) {
  let params: RoundTripFaresRequestOptions = {
    market: LanguageCode.ENGLISH,
    adultPaxCount: 1,
    outboundDepartureTimeFrom: '00:00',
    outboundDepartureTimeTo: '23:59',
    inboundDepartureTimeFrom: '00:00',
    inboundDepartureTimeTo: '23:59',
    ...options,
  };

  console.log("getRoundTripFares", params);

  const axiosResponse = await api.get<RoundTripFaresResponse>(
    '/api/farfnd/v4/roundTripFares', {
      params
    }
  );
  console.log("axiosResponse", axiosResponse);
  return axiosResponse.data;
}

export async function getActiveAirports() {  
  const axiosResponse = await api.get<ActiveAirportsResponse[]>("api/views/locate/5/airports/en/active");
  console.log("axiosResponse", axiosResponse);
  return axiosResponse.data;
}
