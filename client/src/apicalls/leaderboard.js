import axiosInstance from "./index";

// Get leaderboard data with filtering options
export const getLeaderboardData = async (filters) => {
  try {
    // Convert filter object to query string
    const queryParams = new URLSearchParams();
    if (filters) {
      if (filters.period && filters.period !== 'all') {
        queryParams.append('period', filters.period);
      }
      if (filters.category && filters.category !== 'all') {
        queryParams.append('category', filters.category);
      }
      if (filters.examId && filters.examId !== 'all') {
        queryParams.append('examId', filters.examId);
      }
    }

    console.log("Fetching leaderboard with params:", queryParams.toString());

    const response = await axiosInstance.get(
      `/leaderboard/get-leaderboard?${queryParams.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error in getLeaderboardData:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error fetching leaderboard data",
    };
  }
};

// Get personal leaderboard statistics for a user
export const getUserLeaderboardStats = async (userId) => {
  try {
    // Use query params instead of request body for GET request
    const response = await axiosInstance.get(
      `/leaderboard/user-stats?userId=${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error in getUserLeaderboardStats:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error fetching user statistics",
    };
  }
};

// Get admin dashboard statistics
export const getAdminLeaderboardStats = async () => {
  try {
    const response = await axiosInstance.get(
      `/leaderboard/admin-stats?isAdmin=true`
    );
    return response.data;
  } catch (error) {
    console.error("Error in getAdminLeaderboardStats:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error fetching admin statistics",
    };
  }
};