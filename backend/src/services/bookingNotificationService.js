/**
 * Notification Service
 * Handles stubs for WhatsApp, Email and SMS notifications for bookings and orders.
 */

exports.sendBookingConfirmation = async (appointment) => {
    // In a real app, you'd call a WhatsApp API (like Twilio or Gupshup) or an Email service (SendGrid)
    console.log(`[Notification] Sending booking confirmation to ${appointment.phoneNumber} for ${appointment.customerName}`);
    console.log(`[Details] Service: ${appointment.service?.name}, Date: ${appointment.appointmentDate}, Time: ${appointment.appointmentTime}`);
    
    // Simple placeholder for future integration
    return true;
};

exports.sendSystemAlert = async (type, message) => {
    console.log(`[System Alert] ${type.toUpperCase()}: ${message}`);
    return true;
};

exports.notifyAdminNewBooking = async (appointment) => {
    console.log(`[Admin Notification] New appointment request from ${appointment.customerName} (${appointment.phoneNumber})`);
    return true;
};
