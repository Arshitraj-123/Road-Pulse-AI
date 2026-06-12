// Mock Twilio SMS sender with fallback for development
export const sendSMSOTP = async (phone, otp) => {
  if (process.env.TWILIO_ACCOUNT_SID === 'your_sid') {
    console.log(`[MOCK SMS] To: ${phone} | OTP: ${otp}`);
    return true;
  }
  
  // Real twilio integration would go here
  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `Your RoadPulse AI verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: phone
    });
    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error.message);
    throw new Error('Failed to send SMS OTP');
  }
};
