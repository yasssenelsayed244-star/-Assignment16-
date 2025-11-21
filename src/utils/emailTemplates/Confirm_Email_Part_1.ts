import crypto from "crypto";

// ==================== OTP HELPER FUNCTIONS ====================

// توليد OTP عشوائي
export const generateOTP = (length: number = 6): string => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// تشفير الـ OTP قبل حفظه في قاعدة البيانات
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// توليد وقت انتهاء الـ OTP
export const generateOTPExpiry = (minutes: number = 10): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

// ==================== EMAIL VERIFICATION TEMPLATE ====================

export const getEmailVerificationTemplate = (otp: string, userName: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 50px auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #4CAF50;
        }
        .header h1 {
          color: #4CAF50;
          margin: 0;
        }
        .content {
          padding: 30px 0;
          text-align: center;
        }
        .content p {
          color: #555;
          font-size: 16px;
          line-height: 1.6;
        }
        .otp-box {
          background-color: #f9f9f9;
          border: 2px dashed #4CAF50;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          color: #4CAF50;
          letter-spacing: 5px;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #999;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Thank you for signing up! Please verify your email address by using the OTP code below:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Your App. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};