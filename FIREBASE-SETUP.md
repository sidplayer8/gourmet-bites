#  LOGIN SETUP GUIDE

## FIREBASE GOOGLE LOGIN (5 minutes)

### Step 1: Create Firebase Project
1. Go to: https://console.firebase.google.com/
2. Click "Add project"
3. Name it: "gourmet-bites"
4. Disable Google Analytics (not needed)
5. Click "Create project"

### Step 2: Add Web App
1. In Firebase console, click the web icon (</>)
2. App nickname: "gourmet-bites-web"
3. Don't check Firebase Hosting
4. Click "Register app"
5. **COPY YOUR CONFIG** - you'll see something like:

\\\javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "gourmet-bites-xxxxx.firebaseapp.com",
  projectId: "gourmet-bites-xxxxx",
  storageBucket: "gourmet-bites-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxxxxxxxxx"
};
\\\

### Step 3: Enable Google Sign-In
1. In Firebase console, go to "Authentication"
2. Click "Get started"
3. Click "Sign-in method" tab
4. Click "Google"
5. Toggle "Enable"
6. Select your support email
7. Click "Save"

### Step 4: Add Authorized Domain
1. Still in Authentication  Sign-in method
2. Scroll to "Authorized domains"
3. Add: localhost

### Step 5: Update login.html
1. Open c:\Projects\Demo\login.html in VS Code
2. Find this line (around line 21):
   \const firebaseConfig = { apiKey: "AIza-REPLACE", ...\
3. **REPLACE IT** with your actual config from Step 2

### Step 6: Test
1. Go to http://localhost:8080/login.html
2. Click "CONTINUE WITH GOOGLE"
3. Select your Google account
4.  Should redirect to menu!

---

## TWILIO SMS (10 minutes)

### Step 1: Create Twilio Account
1. Go to: https://www.twilio.com/try-twilio
2. Sign up (free trial)
3. Verify your phone number
4. Get free trial credits

### Step 2: Get Phone Number
1. In Twilio console, go to Phone Numbers
2. Click "Get a number"
3. Accept the number they offer
4. Copy your phone number (e.g., +1234567890)

### Step 3: Get Credentials
1. In Twilio console Dashboard
2. Copy:
   - Account SID
   - Auth Token

### Step 4: Update .env
1. Open c:\Projects\Demo\.env in VS Code
2. Replace values:
\\\
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxx (your actual SID)
TWILIO_AUTH_TOKEN=your_actual_token
TWILIO_PHONE_NUMBER=+1234567890 (your number)
\\\

### Step 5: Start Backend
1. Open terminal in Demo folder
2. Run: \
pm start\
3. Server starts on port 8080

### Step 6: Test
1. Go to http://localhost:8080/login.html
2. Enter YOUR phone number
3. Click "SEND SMS CODE"
4. Check your phone for code
5. Enter code
6.  Should redirect to menu!

---

## QUICK TEST (No Setup Needed)

For immediate testing, I've added a bypass:
- Click "CONTINUE WITH GOOGLE" 
- If Firebase not setup, it will ask for username
- Enter any name to continue to menu

This is TEMPORARY for testing only!
