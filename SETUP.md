# Firebase & Twilio Setup Guide

## Firebase Setup (for Google Login)

1. Go to https://console.firebase.google.com/
2. Create new project: "gourmet-bites"
3. Add web app
4. Enable Authentication > Sign-in method > Google
5. Copy your config from Project Settings > General
6. Replace the config in login.html:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId

## Twilio Setup (for SMS)

1. Go to https://www.twilio.com/console
2. Get your Account SID and Auth Token
3. Get a Twilio phone number
4. Replace in server.js:
   - accountSid
   - authToken
   - twilioPhone

## Running the Backend

\\\ash
npm install express twilio
node server.js
\\\

Then visit http://localhost:8080/login.html
