import axios from "axios";
import { parentUrls } from "../appurls";

const DashboardService = {
  parentDashboard: async (userId, date, class_id, token) => {
    try {
      // console.log(parentUrls.daily_checkin)
      const response = await axios.get(parentUrls.daily_checkin, {
        params: {
          student_id: userId,
          date: date,
          class_id: class_id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(response.data)
      return response.data;
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  },
  getNoticeBoard: async (token, branchId) => {
    // console.log("notivve board ", parentUrls.notice_board);
    try {
      const response = await axios.get(parentUrls.notice_board, {
        params: {
          branch_id: branchId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log("branch response", response.data);
      return response;
    } catch (error) {
      console.error(error);
    }
  },
};

export default DashboardService;
