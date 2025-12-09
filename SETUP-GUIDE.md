#  Firebase & Twilio Setup Guide

## Quick Start (Testing Mode)

1. **Install dependencies:**
\\\ash
npm install
\\\

2. **Start server:**
\\\ash
npm start
\\\

3. **Open:** http://localhost:8080/login.html

**SMS will work in MOCK MODE** - the server will display the code in console!

---

## Production Setup

### Firebase (Google Login)

1. Go to https://console.firebase.google.com/
2. Click "Add project"  Name: "gourmet-bites"
3. Go to Authentication  Get started
4. Enable "Google" sign-in method
5. Add domain: localhost (for testing)
6. Get your config:
   - Project Settings  General  Your apps  Web app
   - Copy the config object

7. **Update login.html**:
   Replace lines 22-26 with your config:
\\\javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id"
};
\\\

### Twilio (SMS)

1. Go to https://www.twilio.com/try-twilio
2. Sign up (free trial gives you test credits)
3. Get a phone number
4. Find your credentials in Console:
   - Account SID
   - Auth Token  
   - Phone Number

5. **Create .env file:**
\\\ash
cp .env.example .env
\\\

6. **Edit .env** with your Twilio credentials:
\\\
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
\\\

7. **Restart server:**
\\\ash
npm start
\\\

---

## Testing

### Test Google Login:
1. Go to http://localhost:8080/login.html
2. Click "CONTINUE WITH GOOGLE"
3. Select your Google account
4. Should redirect to menu page

### Test SMS (Mock Mode):
1. Enter any phone number: +12345678901. Go to http://localhost:8080/login.html
2. Click "SEND SMS CODE"
3. **Check server console** - you'll see:  MOCK SMS CODE: 123456
4. Enter that code
5. Should redirect to menu page

### Test SMS (Production):
- Same steps, but SMS will be sent to real phone!

---

## Troubleshooting

**Google login shows error:**
- Make sure you updated Firebase config in login.html
- Check Firebase console that Google provider is enabled

**SMS doesn't send:**
- Check .env file exists and has correct credentials
- Check Twilio phone number format: +1234567890
- In mock mode, check server console for code

**Need help?**
- Firebase docs: https://firebase.google.com/docs/auth
- Twilio docs: https://www.twilio.com/docs/sms
