# Always Care Animal Clinic - Feedback System

A web-based feedback system for two clinic locations (Ghatkopar and Kandivali) with automatic Telegram notifications.

## Features

- 🏥 Two separate feedback forms for Ghatkopar and Kandivali clinics
- 💾 Automatic data storage in JSON files
- 📱 Telegram notifications for each submission
- 🎨 Beautiful, responsive UI
- 📊 Monthly prize draw system (3 winners per month)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Telegram Bot

1. **Create a Telegram Bot:**
   - Open Telegram and search for `@BotFather`
   - Send `/newbot` and follow the instructions
   - Copy the bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

2. **Get Your Chat ID:**
   - Start a chat with your bot
   - Send a message to your bot
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Look for `"chat":{"id":123456789}` - that number is your chat ID

### 3. Configure Environment Variables

Create a `.env` file in the project root (or set environment variables):

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
PORT=3000
```

**OR** set them directly when running:

```bash
TELEGRAM_BOT_TOKEN=your_token TELEGRAM_CHAT_ID=your_id npm start
```

### 4. Run the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

### 5. Access the Forms

- **Home/Clinic Selection:** http://localhost:3000/
- **Ghatkopar Form:** http://localhost:3000/ghatkopar
- **Kandivali Form:** http://localhost:3000/kandivali

## How It Works

1. **Form Submission:** Users fill out the feedback form for their clinic location
2. **Data Storage:** Feedback is saved to `data/ghatkopar_feedback.json` or `data/kandivali_feedback.json`
3. **Telegram Notification:** A formatted message is automatically sent to your Telegram chat
4. **Confirmation:** User receives a success message confirming their entry

## Data Storage

All feedback entries are stored in the `data/` directory:
- `data/ghatkopar_feedback.json` - All Ghatkopar clinic feedback
- `data/kandivali_feedback.json` - All Kandivali clinic feedback

Each entry includes:
- Clinic location
- Timestamp
- All form responses
- Date of visit, case number, contact info
- All feedback question responses
- Improvement suggestions

## Viewing Feedback Data

You can view all feedback via the API:

```bash
# View Ghatkopar feedback
curl http://localhost:3000/api/feedback/ghatkopar

# View Kandivali feedback
curl http://localhost:3000/api/feedback/kandivali
```

## Deployment

### Option 1: Local Network
Run the server and access it from any device on your local network using your computer's IP address.

### Option 2: Cloud Hosting
Deploy to services like:
- **Heroku** (free tier available)
- **Railway**
- **Render**
- **DigitalOcean**
- **AWS/Azure/GCP**

Make sure to:
1. Set environment variables in your hosting platform
2. Update the port configuration if needed
3. Use a process manager like PM2 for production

### Option 3: VPS/Server
1. Install Node.js on your server
2. Clone/upload this project
3. Install dependencies: `npm install`
4. Set environment variables
5. Use PM2 to run: `pm2 start server.js`
6. Set up a reverse proxy (nginx) if needed

## Monthly Prize Draw

To select 3 winners each month:
1. Access the feedback JSON files in the `data/` directory
2. Filter entries by month
3. Randomly select 3 entries
4. Contact winners using their provided contact information

## Troubleshooting

**Telegram not working?**
- Verify your bot token is correct
- Make sure you've sent at least one message to your bot
- Check that your chat ID is correct (should be a number, not a username)

**Forms not submitting?**
- Check that the server is running
- Open browser console (F12) to see any errors
- Verify the API endpoint is accessible

**Data not saving?**
- Check that the `data/` directory exists and is writable
- Look for error messages in the server console

## Support

For issues or questions, check the server console logs for detailed error messages.

