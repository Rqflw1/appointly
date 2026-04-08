import {
  AppointmentStatus,
  PaymentMethod,
  PaymentStatus,
  ReminderStatus,
  ReminderType,
  UserRole
} from "@/app/_prisma/enums";

export default {
  labels: {
    dashboard: "Dashboard",
    clients: "Clients",
    services: "Services",
    appointments: "Appointments",
    calendar: "Calendar",
    payments: "Payments",
    reports: "Reports",
    reminders: "Reminders",
    users: "Users",
    auditLog: "Audit log",
    profile: "Profile",
    settings: "Settings",
    signIn: "Sign in",
    signOut: "Sign out",
    email: "Email",
    password: "Password",
    name: "Name",
    role: "Role",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    search: "Search",
    filters: "Filters",
    status: "Status",
    paymentStatus: "Payment status",
    paymentMethod: "Payment method",
    amount: "Amount",
    date: "Date",
    time: "Time",
    actions: "Actions",
    notes: "Notes",
    client: "Client",
    service: "Service",
    price: "Price",
    duration: "Duration",
    reminder: "Reminder",
    type: "Type",
    send: "Send",
    markSent: "Mark sent",
    success: "Success",
    loading: "Loading",
    today: "Today",
    thisMonth: "This month",
    thisWeek: "This week",
    total: "Total",
    overdue: "Overdue",
    upcoming: "Upcoming",
    unpaid: "Unpaid",
    paid: "Paid",
    partiallyPaid: "Partially paid",
    create: "Create",
    update: "Update",
    view: "View",
    back: "Back",
    exportCsv: "Export CSV",
    page: "Page",
    of: "of",
    rowsPerPage: "rows per page"
  },
  errors: {
    required: "This field is required",
    invalidEmail: "Invalid email",
    invalidCredentials: "Invalid email or password",
    unexpectedError: "Unexpected error",
    timeConflict: "Appointment time conflicts with another booking"
  },
  roles: {
    [UserRole.ADMIN]: "Admin",
    [UserRole.MANAGER]: "Manager"
  },
  appointmentStatus: {
    [AppointmentStatus.PLANNED]: "Planned",
    [AppointmentStatus.COMPLETED]: "Completed",
    [AppointmentStatus.CANCELLED]: "Cancelled",
    [AppointmentStatus.NO_SHOW]: "No show"
  },
  paymentStatus: {
    [PaymentStatus.UNPAID]: "Unpaid",
    [PaymentStatus.PAID]: "Paid",
    [PaymentStatus.PARTIALLY_PAID]: "Partially paid"
  },
  paymentMethod: {
    [PaymentMethod.CASH]: "Cash",
    [PaymentMethod.CARD]: "Card",
    [PaymentMethod.BANK_TRANSFER]: "Bank transfer",
    [PaymentMethod.OTHER]: "Other"
  },
  reminderType: {
    [ReminderType.APPOINTMENT]: "Appointment",
    [ReminderType.PAYMENT]: "Payment",
    [ReminderType.DEBT]: "Debt"
  },
  reminderStatus: {
    [ReminderStatus.PENDING]: "Pending",
    [ReminderStatus.SENT]: "Sent",
    [ReminderStatus.CANCELLED]: "Cancelled"
  },
  empty: {
    clients: "No clients yet",
    services: "No services yet",
    appointments: "No appointments yet",
    payments: "No payments yet",
    reminders: "No reminders yet",
    audit: "No audit events yet"
  }
};
