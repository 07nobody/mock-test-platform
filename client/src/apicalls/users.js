import axiosInstance from "./index";

export const registerUser = async (payload) => {
    try {
        const response = await axiosInstance.post('/users/register', payload);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Registration failed" };
    }
}

export const loginUser = async (payload) => {
    try {
        const response = await axiosInstance.post('/users/login', payload);
        return response.data;
    } catch (error) {
        console.error("Login error in API:", error);
        return error.response?.data || { success: false, message: "Login failed. Please check your credentials." };
    }
}

export const getUserInfo = async () => {
  try {
    const response = await axiosInstance.post("/users/get-user-info");
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return error.response?.data || { success: false, message: "Could not fetch user information" };
  }
};

export const forgotPassword = async (email) => {
    try {
        const response = await axiosInstance.post('/users/forgot-password', { email });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Could not process forgot password request" };
    }
}

export const verifyOtp = async (email, otp) => {
    try {
        const response = await axiosInstance.post('/users/verify-otp', { email, otp });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Could not verify OTP" };
    }
}

export const resetPassword = async (email, newPassword) => {
    try {
        const response = await axiosInstance.post('/users/reset-password', { 
            email, 
            newPassword 
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Could not reset password" };
    }
}

export const updateUserProfile = async (payload) => {
    try {
        const response = await axiosInstance.post('/users/update-profile', payload);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Could not update profile" };
    }
}

export const changePassword = async (payload) => {
    try {
        const response = await axiosInstance.post('/users/change-password', payload);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Could not change password" };
    }
}

// Get user statistics (for profile)
export const getUserStats = async () => {
  try {
    const response = await axiosInstance.get(`/leaderboard/user-stats?userId=${localStorage.getItem("userId")}`);
    return response.data;
  } catch (error) {
    return error.response?.data || {
      success: false,
      message: "Error fetching user statistics"
    };
  }
};
