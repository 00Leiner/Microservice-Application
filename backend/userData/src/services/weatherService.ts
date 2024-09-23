import axios from 'axios';

const API_KEY = process.env.OPENWEATHER_API_KEY;

export const getWeatherByCoordinates = async (latitude: number, longitude: number) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
  const response = await axios.get(url);
  return response.data;
};

export const getSuggestions = async (query: any) => {
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;
  const response = await axios.get(url);
  return response.data;
}