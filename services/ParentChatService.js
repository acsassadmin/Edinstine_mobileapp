import axios from "axios";
import { parentUrls } from "../appurls";

const ParentChatList = {
  getInbox: async (userId, class_id, token) => {
    try {
      // console.log(parentUrls.inbox_chat)
      const response = await axios.get(parentUrls.inbox_chat, {
        params: {
          user_id: userId,
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
  getChats: async (token, branchId) => {
    // console.log(parentUrls.inbox_chat);
    try {
      const response = await axios.get(parentUrls.notice_board, {
        params: {
          branchid: branchId,
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
  getBodcast: async (token, branchId) => {
    // console.log(parentUrls.notice_board);
    try {
      const response = await axios.get(parentUrls.notice_board, {
        params: {
          branchid: branchId,
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

export default ParentChatList;
