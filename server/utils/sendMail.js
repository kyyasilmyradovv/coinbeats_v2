const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kyyas.ilmyradov@gmail.com',
    pass: 'ijqu llap pjed qhoi',
  },
});

exports.sendMail = async (code, email) => {
  const mailOptions = {
    from: `Coinbeats Verification <kyyasilmyradov@gmail.com>`,
    to: email,
    subject: 'Coinbeats Verification',
    html: `
      <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: #4a90e2; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Coinbeats Verification</h1>
          </div>
          <div style="padding: 30px; text-align: center;">
            <p style="font-size: 16px; color: #333333; margin: 0 0 20px;">Your verification code is:</p>
            <p style="font-size: 32px; font-weight: bold; color: #4a90e2; margin: 0;">${code}</p>
            <p style="font-size: 14px; color: #666666; margin: 20px 0 0;">Please enter this code to verify your email address.</p>
          </div>
          <div style="background: #f0f0f0; padding: 10px; text-align: center;">
            <p style="font-size: 12px; color: #999999; margin: 0;">© ${new Date().getFullYear()} Coinbeats. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  };

  transporter.sendMail(mailOptions, function (err) {
    if (err) {
      console.log(err);
    }
  });
};
