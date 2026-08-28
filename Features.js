class Features {
  constructor({
    notice_board = false,
    events = false,
    portfolio = false,
    chat = {},
    fee_management = false,
    check_in_check_out = false,
    medical_instruction = false,
    health_update = false,
    upcoming_birthday = false,
    bus_tracking = false,
    library_management = false,
    record_of_work = false,
    activity_log = false,
    certificate_management = false,
    report_card_management = false,
    inventory_management = false,
    finance_management = false,
    homework = false,
    staff_checkin = false,
    staff_leave_management = false,
    staff_leave_history = false,
    student_leave_management = false,
    student_leave_history = false,
    student_leave_approval = false,
  } = {}) {
    this.notice_board = notice_board;
    this.events = events;
    this.portfolio = portfolio;
    this.chat = {
      inbox: chat.inbox || false,
      group: chat.group || false,
      broadcast: chat.broadcast || false,
    };
    this.fee_management = fee_management;
    this.check_in_check_out = check_in_check_out;
    this.medical_instruction = medical_instruction;
    this.health_update = health_update;
    this.upcoming_birthday = upcoming_birthday;
    this.bus_tracking = bus_tracking;
    this.library_management = library_management;
    this.record_of_work = record_of_work;
    this.activity_log = activity_log;
    this.certificate_management = certificate_management;
    this.report_card_management = report_card_management;
    this.inventory_management = inventory_management;
    this.finance_management = finance_management;
    this.homework = homework;
    this.staff_checkin = staff_checkin;
    this.staff_leave_management = staff_leave_management;
    this.student_leave_management = student_leave_management;
    this.staff_leave_history = staff_leave_history;
    this.student_leave_history = student_leave_history;
    this.student_leave_approval = student_leave_approval;
  }
}

const AppFeatures = new Features({
  chat: { inbox: true, group: true },
  upcoming_birthday: true,
  bus_tracking: true,
  portfolio: true,
  staff_leave_management: true,
  staff_leave_history: true,
});

// console.log(AppFeatures);
export default AppFeatures;
