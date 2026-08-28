import Features from "./features.class";

export function mapFeatures(featureList = []) {
  const set = new Set(featureList);
  // console.log("map set",set)
  return new Features({
    notice_board: set.has("notice_board"),
    events: set.has("events"),
    portfolio: set.has("portfolio"),

    chat: {
      inbox: set.has("inbox"),
      group: set.has("group"),
      broadcast: set.has("broadcast"),
    },

    fee_management: set.has("fee_management"),
    check_in_check_out: set.has("check_in_check_out"),
    medical_instruction: set.has("medical_instruction"),
    health_update: set.has("health_update"),
    upcoming_birthday: set.has("upcoming_birthday"),
    bus_tracking: set.has("bus_tracking"),
    library_management: set.has("library_management"),
    record_of_work: set.has("record_of_work"),
    activity_log: set.has("activity_log"),
    certificate_management: set.has("certificate_management"),
    report_card_management: set.has("report_card_management"),
    inventory_management: set.has("inventory_management"),
    finance_management: set.has("finance_management"),
    homework: set.has("homework"),
    staff_checkin: set.has("staff_checkin"),
    staff_leave_management: set.has("staff_leave_management"),
    staff_leave_history: set.has("staff_leave_history"),
    student_leave_management: set.has("student_leave_management"),
    student_leave_history: set.has("student_leave_history"),
    student_leave_approval: set.has("student_leave_approval"),
  });
}
