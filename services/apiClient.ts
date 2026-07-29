import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { STORAGE_KEYS } from "@/lib/constants";
import { storage } from "@/lib/utils/storage";

import { axiosInstance } from "./axios";

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.get<string | null>(STORAGE_KEYS.AUTH_TOKEN, null);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    }

    return Promise.reject(error);
  },
);

export { axiosInstance as apiClient };
