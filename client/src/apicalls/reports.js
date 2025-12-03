const { default: axiosInstance } = require(".");

// add report
export const addReport = async (payload) => {
    try {
        const response = await axiosInstance.post("/reports/add-report", payload);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

// get all reports
export const getAllReports = async (filters) => {
    try {
        const response = await axiosInstance.post("/reports/get-all-reports", filters);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
} 

// get all reports by user
export const getAllReportsByUser = async () => {
    try {
        const response = await axiosInstance.post("/reports/get-all-reports-by-user");
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

// Get all reports by user (alias for getAllReportsByUser for backward compatibility)
export const getUserReports = async (userId) => {
  return getAllReportsByUser(userId);
};