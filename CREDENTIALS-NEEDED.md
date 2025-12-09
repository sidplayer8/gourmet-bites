#  CREDENTIALS NEEDED

## For Google Login (Firebase):

I need your Firebase configuration. To get it:

1. Go to: https://console.firebase.google.com/
2. Click "Add project"  Name: "gourmet-bites"  Create
3. Click Settings icon ()  Project settings
4. Scroll down to "Your apps"  Click Web icon (</>)
5. Register app  App nickname: "Gourmet Bites"
6. Copy the firebaseConfig object

You'll see something like this:

const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "gourmet-bites-xxxxx.firebaseapp.com",
  projectId: "gourmet-bites-xxxxx",
  storageBucket: "gourmet-bites-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxxxxxxxxx"
};

7. Also enable Google sign-in:
   - Go to Authentication  Get started
   - Click "Sign-in method" tab
   - Enable "Google"
   - Save

## GIVE ME THESE VALUES:

apiKey: 
authDomain: 
projectId: 
storageBucket: 
messagingSenderId: 
appId: 

---

## For SMS (Twilio) - Optional for now:

TWILIO_ACCOUNT_SID: 
TWILIO_AUTH_TOKEN: 
TWILIO_PHONE_NUMBER: 

(Get these from twilio.com/try-twilio after signup)

---

Just copy-paste your values and I'll configure everything!
