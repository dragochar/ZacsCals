// api.js

import axios from 'axios';

const API = axios.create({
  baseURL: 'https://speedlead.herokuapp.com', // Replace with your backend API URL
  timeout: 5000, // Set a timeout for requests (in milliseconds)
});

// Add any additional configuration or headers here if needed

export const loginOrSignup = async (phoneNumber: string) => {
  try {

    const response = await API.post('/zacs-cals/loginOrSignup', { phoneNumber: phoneNumber });
    return response.data;

  } catch (error) {
    throw error;
  }
};

export const verifyCode = async (phoneNumber: string, verificationCode: string) => {
  try {

    const response = await API.post('/zacs-cals/verifyCode', { phoneNumber: phoneNumber, verificationCode: verificationCode });
    return response.data;

  } catch (error) {
    throw error;
  }
};

export const finishProfile = async (formData: any) => {
  try {

    const response = await API.post('/zacs-cals/completeProfile', formData);
    return response.data;

  } catch (error) {
    throw error;
  }
};

// Add more API functions as needed for your application


export const authenticateToken = async (jwtToken: string) => {
  try {

    const response = await API.post('/zacs-cals/getUser', { token: jwtToken });
    return response.data;

  } catch (error) {
    throw error;
  }
};


export const deleteMeal = async (jwtToken: string, mealId: string) => {
  
  try {

    const response = await API.post('/zacs-cals/deleteMeal', { token: jwtToken, mealId: mealId });
    return response.data;

  } catch (error) {
    throw error;
  }
}