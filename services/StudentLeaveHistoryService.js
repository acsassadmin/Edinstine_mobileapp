import axios from "axios";
import { parentUrls } from "../appurls";
import { InvalidTokenError } from "jwt-decode";

const StudentLeaveHistoryServices = {
  getLeaveHistory: async (user_id, page = 1, token) => {
    try {
      const url = `${parentUrls.leave_history}${user_id}&page=${page}`;
      // console.log("Fetching leave history:", url);
      // console.log('tokenssssss',token)
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.error === "Invalid or expired token") {
        // throw new InvalidTokenError("Token expired, please logout");
      }

      // console.log("Response data:", response.data);
      return response.data;
    } catch (error) {
      // console.log(error.response)
      if (
        error.response?.status === 401 ||
        error instanceof InvalidTokenError
      ) {
        // throw new InvalidTokenError("Token expired, please logout");
      }

      // throw error;
    }
  },
  applyLeave: async (token, payload) => {
    try {
      // console.log("apply leave",payload)
      const response = await axios.post(parentUrls.apply_leave, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response;
    } catch (error) {}
  },

  getLeaveTypes: async (token, school_id) => {
    const response = await axios.get(parentUrls.leave_types, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        school_id: school_id,
      },
    });
    // console.log("parent leave types", response.data);
    if (response.data?.error === "Invalid or expired token") {
      throw new InvalidTokenError("Token expired, please logout");
    }
    return response.data;
  },
};

export default StudentLeaveHistoryServices;
