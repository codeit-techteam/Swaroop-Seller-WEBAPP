import axios from "axios";

import { API_BASE_URL } from "@/lib/constants";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
