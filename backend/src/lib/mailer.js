// Mock Nodemailer with fallback for development
export const sendEmailOTP = async (email, otp) => {
  if (process.env.MAIL_USER === 'roadpulse.noreply@gmail.com') {
    console.log(`[MOCK EMAIL] To: ${email} | OTP: ${otp}`);
    return true;
  }
  
  // Real nodemailer integration
  try {
    const nodemailer = (await import('nodemailer')).default;
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"RoadPulse AI" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code',
      text: `Your RoadPulse AI verification code is: ${otp}`
    });
    return true;
  } catch (error) {
    console.error('Failed to send Email:', error.message);
    throw new Error('Failed to send Email OTP');
  }
};

export const notifyAdminNewContractorRequest = async (municipalityId, companyName, contactPerson) => {
  console.log(`[MOCK EMAIL to Admin] New Contractor Request: ${companyName} (${contactPerson}) for ${municipalityId}`);
  return true;
};

export const sendApprovalEmail = async (contractor) => {
  console.log(`[MOCK EMAIL to Contractor] Application Approved: ${contractor.companyName}. You can now log in and access the work queue.`);
  return true;
};

export const sendRejectionEmail = async (contractor, reason) => {
  console.log(`[MOCK EMAIL to Contractor] Application Rejected: ${contractor.companyName}. Reason: ${reason}`);
  return true;
};
