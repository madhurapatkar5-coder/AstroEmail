require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://incredible-gaufre-a0e991.netlify.app' // change if needed
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'api-key'],
  credentials: false
}));

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
          { email: 'madhura.patkar5@gmail.com' }
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
    if (email) {
      try {
        await axios.post(
          'https://api.brevo.com/v3/smtp/email',
          {
            sender: {
              name: 'Astroguide',
              email: process.env.BREVO_USER
            },
            to: [{ email }],
            subject: 'We received your message | Astroguide',
            htmlContent: `
            <p>Dear ${name},</p>
            <p>Thank you for contacting <b>Astroguide</b>.</p>
            <p>We have received your enquiry and our team will review it shortly.</p>
            <p>Wishing you clarity, balance, and positive energies.</p>
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
      } catch (autoReplyErr) {
        // DO NOT FAIL REQUEST
        console.warn('Auto-reply failed:', autoReplyErr.response?.data || autoReplyErr.message);
      }
    }

    // ALWAYS SUCCESS
    return res.json({ success: true });
  } catch (err) {
    console.error('Admin mail failed:', err.response?.data || err.message);
    return res.json({ success: true });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));