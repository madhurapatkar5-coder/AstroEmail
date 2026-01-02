require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');

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

    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Astroguide',
          email: process.env.BREVO_USER
        },
        to: [
          { email: 'contact@astroguide.in' }
        ],
        replyTo: {
          email: email
        },
        subject: 'New Contact Us Enquiry',
        htmlContent: `
          <h3>New Enquiry</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Message:</b> ${message}</p>
        `
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    /* OPTIONAL AUTO-REPLY */
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Astroguide',
          email: process.env.BREVO_USER
        },
        to: [{ email }],
        subject: 'We received your message – Astroguide',
        htmlContent: `
          <p>Dear ${name},</p>
          <p>Thank you for contacting <b>Astroguide</b>.</p>
          <p>We will get back to you shortly.</p>
          <p>Regards,<br>Astroguide Team</p>
        `
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ success: true });

  } catch (err) {
    console.error('BREVO API ERROR:', err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data || err.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));