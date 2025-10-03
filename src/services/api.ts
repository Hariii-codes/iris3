import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export const getTransactions = async () => {
  try {
    const res = await axios.get(`${API_URL}/transactions`);
    return res.data;
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return [];
  }
};

export const createTransaction = async (data: { client_id: string, merchant_id: string, amount: number, description: string }) => {
  try {
    const res = await axios.post(`${API_URL}/transactions`, data);
    return res.data;
  } catch (err) {
    console.error("Error creating transaction:", err);
    return null;
  }
};
