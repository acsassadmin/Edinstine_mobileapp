const baseurl = "https://backend.lilleed.com/api";
export const BASEURL = "https://backend.lilleed.com";
export const scoketUrl = "wss://backend.lilleed.com/ws/";

// const baseurl = "http://192.168.1.109:8000/api";
// export const BASEURL = "http://192.168.1.109:8000";
// export const scoketUrl = "ws://192.168.1.109:8000/ws/";

export const appUrls = {
  login: baseurl + "/core/login/",
  applyed_leaves: baseurl + "/common/leave-requests/",
  leave_request: baseurl + "/common/staff-leave-request/",
  leave_types: baseurl + "/common/leave-type/",
  check_in_check_out: baseurl + "/parent/student-attendance/",
  check_in_time: baseurl + "/common/staff-attendance-log/",
  reset_password: baseurl + "/core/reset-password/",
};

export const parentUrls = {
  apply_leave: baseurl + "/common/leave-requests/",
  leave_history: baseurl + "/common/leave-requests/?student_id=",
  daily_checkin: baseurl + "/parent/student-attendance/",
  leave_types: baseurl + "/common/student-leave-type/",
  notice_board: baseurl + "/common/notices/",
  inbox_chat: baseurl + "/common/chatuserlist/",
};

// const baseurl = "http://192.168.1.111:8000/api";
// export const BASEURL = "http://192.168.1.111:8000";
// export const scoketUrl = "ws://192.168.1.111:8000/ws/";

// export const appUrls = {
//   login: baseurl + "/core/login/",
//   applyed_leaves: baseurl + "/common/leave-requests/",
//   leave_request: baseurl + "/common/staff-leave-request/",
//   leave_types: baseurl + "/common/leave-type/",
//   check_in_check_out: baseurl + "/parent/student-attendance/",
//   check_in_time: baseurl + "/common/staff-attendance-log/",
//   reset_password: baseurl + "/core/reset-password/",
// };

// export const parentUrls = {
//   apply_leave: baseurl + "/common/leave-requests/",
//   leave_history: baseurl + "/common/leave-requests/?student_id=",
//   daily_checkin: baseurl + "/parent/student-attendance/",
//   leave_types: baseurl + "/common/student-leave-type/",
//   notice_board: baseurl + "/common/notices/",
//   inbox_chat: baseurl + "/common/chatuserlist/",
// };
