// ==================== EMAIL VERIFIED SUCCESS TEMPLATE ====================

export const getEmailVerifiedSuccessTemplate = (userName: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verified Successfully</title>
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
        }
        .success-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          background-color: #4CAF50;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 50px;
          color: white;
        }
        .header h1 {
          color: #4CAF50;
          margin: 0;
        }
        .content {
          padding: 20px 0;
          text-align: center;
        }
        .content p {
          color: #555;
          font-size: 16px;
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          margin: 20px 0;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
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
          <div class="success-icon">✓</div>
          <h1>Email Verified Successfully!</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Congratulations! Your email has been verified successfully.</p>
          <p>You can now enjoy full access to all features of our platform.</p>
          <a href="${process.env.FRONTEND_URL || '#'}" class="button">Go to Dashboard</a>
        </div>
        <div class="footer">
          <p>&copy; 2025 Your App. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
