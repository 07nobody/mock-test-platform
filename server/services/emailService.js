const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email (Resend provides a free domain for testing)
const FROM_EMAIL = process.env.FROM_EMAIL || 'Mock Test Platform <onboarding@resend.dev>';

// Dev mode - if true, emails are logged to console instead of sent
const DEV_MODE = process.env.EMAIL_DEV_MODE === 'true';

/**
 * Dev mode helper - logs email to console instead of sending
 */
function logEmailToConsole(to, subject, html) {
  console.log('\n' + '='.repeat(60));
  console.log('📧 EMAIL (DEV MODE - NOT SENT)');
  console.log('='.repeat(60));
  console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`);
  console.log(`Subject: ${subject}`);
  console.log('-'.repeat(60));
  // Extract text content from HTML for readable console output
  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log(`Content: ${textContent.substring(0, 500)}${textContent.length > 500 ? '...' : ''}`);
  console.log('='.repeat(60) + '\n');
  return { id: 'dev-mode-' + Date.now() };
}

/**
 * Core email sending function with dev mode support
 */
async function sendEmail(to, subject, html) {
  // Dev mode - just log to console
  if (DEV_MODE) {
    return { data: logEmailToConsole(to, subject, html), error: null };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Send OTP email for password reset
 */
async function sendOTPEmail(email, otp) {
  const subject = 'Password Reset OTP';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0F3460;">Mock Test Platform Password Reset</h2>
      <p>Your OTP for password reset is:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
        <strong>${otp}</strong>
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        If you didn't request this password reset, please ignore this email.
      </p>
    </div>
  `;

  const { data, error } = await sendEmail(email, subject, html);
  
  if (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }

  console.log('OTP Email sent successfully:', data.id);
  return data;
}

/**
 * Send payment receipt to user and notification to admin
 */
async function sendPaymentReceipt(payment, exam, user) {
  try {
    const paymentDate = new Date(payment.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    const paymentTime = new Date(payment.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
    const paymentMethodFormatted = payment.paymentMethod
      .split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const examCode = exam.examCode || "Please contact support for your exam code";
    
    const userSubject = `Payment Receipt & Exam Code for ${exam.name}`;
    const userHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #0F3460;">Payment Receipt</h2>
        <div style="background-color: #ffe8e8; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; border: 2px dashed #ff6b6b;">
          <h3 style="color: #d40000;">YOUR EXAM CODE</h3>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${examCode}</div>
        </div>
        <p><strong>Receipt:</strong> ${payment.receiptNumber}</p>
        <p><strong>Transaction:</strong> ${payment.transactionId}</p>
        <p><strong>Date:</strong> ${paymentDate} ${paymentTime}</p>
        <p><strong>Exam:</strong> ${exam.name}</p>
        <p><strong>Amount:</strong> ₹${payment.amount}</p>
        <p><strong>Method:</strong> ${paymentMethodFormatted}</p>
      </div>
    `;

    const { data: userData, error: userError } = await sendEmail(user.email, userSubject, userHtml);
    if (userError) {
      console.error('User receipt email failed:', userError);
    } else {
      console.log(`Payment receipt sent to: ${user.email} (ID: ${userData.id})`);
    }

    // Admin notification
    const adminEmails = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.split(',').map(e => e.trim()) : [];
    if (adminEmails.length > 0) {
      const adminSubject = `💰 Payment (₹${payment.amount}) - ${user.name} - ${exam.name}`;
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Payment Received</h2>
          <p><strong>User:</strong> ${user.name} (${user.email})</p>
          <p><strong>Exam:</strong> ${exam.name}</p>
          <p><strong>Amount:</strong> ₹${payment.amount}</p>
          <p><strong>Receipt:</strong> ${payment.receiptNumber}</p>
          <p><strong>Transaction:</strong> ${payment.transactionId}</p>
        </div>
      `;
      const { error: adminError } = await sendEmail(adminEmails, adminSubject, adminHtml);
      if (adminError) console.error('Admin email failed:', adminError);
    }

    return true;
  } catch (error) {
    console.error('Error sending payment receipt:', error);
    return false;
  }
}

/**
 * Send exam code email after registration
 */
async function sendExamCodeEmail(email, examName, examCode) {
  const subject = `Exam Registration - ${examName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0F3460;">Exam Registration Confirmed</h2>
      <p>You have registered for: <strong>${examName}</strong></p>
      <p>Your exam access code:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
        <strong>${examCode}</strong>
      </div>
      <p>Good luck!</p>
    </div>
  `;

  const { data, error } = await sendEmail(email, subject, html);
  if (error) {
    console.error('Exam code email failed:', error);
    throw new Error('Failed to send exam code email');
  }
  console.log('Exam code email sent:', data.id);
  return true;
}

/**
 * Send exam activation notification email
 */
async function sendExamActivationEmail(email, examName, examCode) {
  const subject = `Exam Now Active - ${examName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0F3460;">Exam Now Active!</h2>
      <p>The exam <strong>${examName}</strong> is now ready to take.</p>
      <p>Your exam code:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
        <strong>${examCode}</strong>
      </div>
      <p>Good luck!</p>
    </div>
  `;

  const { data, error } = await sendEmail(email, subject, html);
  if (error) {
    console.error('Exam activation email failed:', error);
    throw new Error('Failed to send exam activation email');
  }
  console.log('Exam activation email sent to', email, ':', data.id);
  return true;
}

module.exports = {
  sendOTPEmail,
  sendPaymentReceipt,
  sendExamCodeEmail,
  sendExamActivationEmail
};
