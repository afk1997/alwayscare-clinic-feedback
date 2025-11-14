require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
const ensureDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
};

// Telegram configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

// Function to send Telegram message
async function sendTelegramMessage(clinic, formData) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('⚠️  Telegram credentials not configured. Skipping Telegram notification.');
    return;
  }

  try {
    // Helper function to escape HTML
    function escapeHtml(text) {
      if (!text) return 'N/A';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Format date as DD/MM/YYYY
    function formatDate(dateString) {
      if (!dateString || dateString === 'N/A') return 'N/A';
      try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      } catch (e) {
        return dateString; // Return original if parsing fails
      }
    }

    const formattedDate = formatDate(formData.dateOfVisit);

    const message = `🐾 <b>NEW FEEDBACK - ${clinic.toUpperCase()} CLINIC</b>\n\n` +
      `📅 <b>Date of Visit:</b> ${escapeHtml(formattedDate)}\n` +
      `🐶 <b>Case Number:</b> ${escapeHtml(formData.caseNumber || 'N/A')}\n` +
      `👤 <b>Name:</b> ${escapeHtml(formData.name || 'N/A')}\n` +
      `📱 <b>Contact Number:</b> ${escapeHtml(formData.contactNumber || 'N/A')}\n\n` +
      `⭐ <b>Overall Rating:</b> ${escapeHtml(formData.overallRating || 'N/A')}\n\n` +
      `💬 <b>Feedback Responses:</b>\n` +
      `🩺 <b>Clear explanation:</b> ${escapeHtml(formData.clearExplanation || 'N/A')}\n` +
      `🐾 <b>Proper attention:</b> ${escapeHtml(formData.properAttention || 'N/A')}\n` +
      `🕓 <b>Waiting time:</b> ${escapeHtml(formData.waitingTime || 'N/A')}\n` +
      `🧹 <b>Clean & comfortable:</b> ${escapeHtml(formData.cleanComfortable || 'N/A')}\n` +
      `💊 <b>Clear instructions:</b> ${escapeHtml(formData.clearInstructions || 'N/A')}\n\n` +
      `💭 <b>Improvements:</b>\n${escapeHtml(formData.improvements || 'None mentioned')}\n\n` +
      `⏰ <b>Submitted:</b> ${escapeHtml(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }))}`;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: String(TELEGRAM_CHAT_ID), // Ensure chat_id is a string
      text: message,
      parse_mode: 'HTML' // Using HTML which is more forgiving
    });
    
    console.log(`✅ Telegram message sent for ${clinic} clinic`);
  } catch (error) {
    console.error('❌ Error sending Telegram message:', error.message);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Status:', error.response.status);
    }
    // Don't throw - allow feedback to be saved even if Telegram fails
    console.warn('⚠️  Feedback saved but Telegram notification failed');
  }
}

// Function to save feedback to file
async function saveFeedback(clinic, formData) {
  await ensureDataDir();
  const timestamp = new Date().toISOString();
  const feedbackEntry = {
    clinic,
    timestamp,
    ...formData
  };

  const fileName = `${clinic}_feedback.json`;
  const filePath = path.join(DATA_DIR, fileName);

  let existingData = [];
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    existingData = JSON.parse(fileContent);
  } catch {
    // File doesn't exist yet, start with empty array
  }

  existingData.push(feedbackEntry);
  await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));
  
  return feedbackEntry;
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/ghatkopar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ghatkopar.html'));
});

app.get('/kandivali', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'kandivali.html'));
});

// Submit feedback endpoint
app.post('/api/submit-feedback', async (req, res) => {
  try {
    const { clinic, ...formData } = req.body;

    if (!clinic || (clinic !== 'ghatkopar' && clinic !== 'kandivali')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid clinic name. Must be "ghatkopar" or "kandivali".' 
      });
    }

    // Save feedback
    const savedEntry = await saveFeedback(clinic, formData);

    // Send Telegram notification
    await sendTelegramMessage(clinic, formData);

    res.json({ 
      success: true, 
      message: 'Thank you for your feedback! Your entry has been recorded for the monthly prize draw.',
      data: savedEntry
    });
  } catch (error) {
    console.error('❌ Error processing feedback:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while processing your feedback. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all feedback (optional admin endpoint)
app.get('/api/feedback/:clinic', async (req, res) => {
  try {
    const clinic = req.params.clinic;
    const fileName = `${clinic}_feedback.json`;
    const filePath = path.join(DATA_DIR, fileName);

    const fileContent = await fs.readFile(filePath, 'utf8');
    const feedback = JSON.parse(fileContent);
    
    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(404).json({ success: false, message: 'No feedback found for this clinic.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Ghatkopar form: http://localhost:${PORT}/ghatkopar`);
  console.log(`📋 Kandivali form: http://localhost:${PORT}/kandivali`);
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log(`⚠️  Telegram not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.`);
  }
});

