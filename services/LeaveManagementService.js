// services/LeaveManagementServices.js
import axios from "axios";
import { appUrls } from "../appurls";

const LeaveManagementServices = {
  getApplyedLeaves: async (token, userId, appUser) => {
    try {
      // console.log("app user", appUser);
      const fetchUrl = appUrls.applyed_leaves;
      const response = await axios.get(fetchUrl, {
        params: { reporting_to: userId, branch_id: appUser?.branch_id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateLeaveStatus: async (token, leave_id, status) => {
    try {
      const response = await axios.put(
        appUrls.applyed_leaves,
        {
          status: status,
        },
        {
          params: {
            id: leave_id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response; // return response data
    } catch (error) {
      console.error("Error updating leave status:", error);
      throw error; // throw to handle in calling code
    }
  },
  getLeaveTypes: async (token, school_id) => {
    const response = await axios.get(appUrls.leave_types, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        school_id: school_id,
      },
    });

    // console.log("Leave types", response.data);
    if (response.data?.error === "Invalid or expired token") {
      throw new InvalidTokenError("Token expired, please logout");
    }
    return response.data;
  },
  applyLeave: async (token, payload) => {
    try {
      // console.log("apply leave", payload);
      const response = await axios.post(appUrls.leave_request, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response;
    } catch (error) {}
  },
  myLeaves: async (token, userId) => {
    try {
      const response = await axios.get(appUrls.leave_request, {
        params: {
          user_id: userId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log("dataaaa", response.data);
      return response.data;
    } catch (error) {
      console.error("error", error);
    }
  },
};

export default LeaveManagementServices;
