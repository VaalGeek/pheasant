import nodemailer from 'nodemailer'

export async function sendEmailOtp(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  const mailOptions = {
    from: '"SchoolComm" <no-reply@schoolcomm.com>',
    to: email,
    subject: 'Your New OTP Code',
    text: `Your new OTP is: ${otp}`,
    html: `<p>Your new OTP is:</p><h2>${otp}</h2>`,
  }

  await transporter.sendMail(mailOptions)
}
