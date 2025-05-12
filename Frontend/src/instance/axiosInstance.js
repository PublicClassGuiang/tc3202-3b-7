import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL

const axiosInstance = axios.create({
  baseURL: baseURL, 
  withCredentials: true
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => Promise.reject(error)
  );

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.get(`${baseURL}/dishes/refresh`, {
          withCredentials: true,
        });

        processQueue(null);
        return axiosInstance(originalRequest); // Retry failed request
      } catch (err) {
        processQueue(err, null);
        // window.location.href = '/'; //back to login
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
