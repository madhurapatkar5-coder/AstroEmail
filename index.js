require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors(
{
  origin: [
    'http://localhost:4200',
    'https://incredible-gaufre-a0e991.netlify.app/'
  ]
}
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/ping', (req, res) => {
  res.json({ status: 'API working' });
});

app.post('/send-email', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_P
      }
    });

    // 📩 Mail to Astroguide team
    await transporter.sendMail({
      from: `Astroguide <${process.env.BREVO_USER}>`,
      to: 'contact@astroguide.in', // Astroguide inbox
      replyTo: email, // reply goes to user
      subject: 'New Contact Us Enquiry',
      html: `
        <h3>New Enquiry from Astroguide Website</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b> ${message}</p>
      `
    });

    //auto reply

    await transporter.sendMail({
      from: `Astroguide <${process.env.BREVO_USER}>`,
      to: email,
      subject: 'We received your message – Astroguide',
      html: `
        <p>Dear ${name},</p>

        <p>Thank you for contacting <b>Astroguide</b>.</p>

        <p>We have received your message and our team will get back to you shortly.</p>

        <p>Warm regards,<br>
        <b>Astroguide Team</b></p>
      `
    });

    res.json({ success: true });

  } catch (err) {
  console.error('SMTP ERROR >>>', err);
  res.status(500).json({
    error: err.message,
    code: err.code
  });
}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));