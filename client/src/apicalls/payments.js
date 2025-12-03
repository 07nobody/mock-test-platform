const { default: axiosInstance } = require(".");

// Create a payment intent for an exam
export const createPayment = async (payload) => {
  try {
    const response = await axiosInstance.post("/payments/create-payment", payload);
    return response.data;
  } catch (error) {
    return error.response?.data || { 
      success: false, 
      message: "Failed to create payment. Please try again." 
    };
  }
};

// Complete an exam payment
export const completePayment = async (payload) => {
  try {
    const response = await axiosInstance.post("/payments/complete-payment", payload);
    return response.data;
  } catch (error) {
    return error.response?.data || { 
      success: false, 
      message: "Failed to complete payment. Please try again." 
    };
  }
};

// Get payment history for a user
export const getUserPayments = async (payload) => {
  try {
    const response = await axiosInstance.post("/payments/get-user-payments", payload);
    return response.data;
  } catch (error) {
    return error.response?.data || { 
      success: false, 
      message: "Failed to fetch payment history." 
    };
  }
};

// Check payment status for an exam
export const checkPaymentStatus = async (payload) => {
  try {
    const response = await axiosInstance.post("/payments/check-payment", payload);
    return response.data;
  } catch (error) {
    return error.response?.data || { 
      success: false, 
      message: "Failed to check payment status." 
    };
  }
};

// Get all payments (admin only)
export const getAllPayments = async (filters = {}) => {
  try {
    const response = await axiosInstance.post("/payments/get-all-payments", filters);
    return response.data;
  } catch (error) {
    return error.response?.data || { 
      success: false, 
      message: "Failed to fetch payments." 
    };
  }
};