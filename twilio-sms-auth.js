// Twilio SMS Authentication
console.log("📱 Twilio SMS Auth Loading v3.2...");

// Global State
window.currentVerifyingPhone = null;
window.currentSentCode = null; // Store code for verification

window.sendTwilioVerificationCode = async function (phoneNumber) {
    console.log("📱 Sending verification code via Twilio...");

    const sendButton = document.getElementById('send-code-btn');
    const countryCode = document.getElementById('country-code')?.value || '+65';
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const fullPhone = countryCode + cleanPhone;

    if (sendButton) {
        sendButton.disabled = true;
        sendButton.textContent = 'Sending...';
    }

    try {
        const response = await fetch('/api/sms/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: fullPhone })
        });

        const data = await response.json();

        if (data.success) {
            console.log("✅ SMS sent successfully!");

            // Store the code (temporary MVP solution)
            window.currentSentCode = data.code;

            // Transition UI
            document.getElementById('phone-step').classList.add('hidden');
            document.getElementById('verification-step').classList.remove('hidden');
            document.getElementById('phone-display').innerText = fullPhone;

            // Store phone for verification
            window.currentVerifyingPhone = fullPhone;
        } else {
            throw new Error(data.error || 'Failed to send SMS');
        }
    } catch (error) {
        console.error("❌ SMS send failed:", error);
        console.error("Failed to send SMS: " + error.message);
        const statusDiv = document.getElementById("status-message");
        if (statusDiv) {
            statusDiv.textContent = "Failed to send SMS: " + error.message;
            statusDiv.style.color = "red";
        }
    } finally {
        if (sendButton) {
            sendButton.disabled = false;
            sendButton.textContent = 'Send Code';
        }
    }
};

window.verifyTwilioSMSCode = async function (code) {
    console.log("🔐 Verifying code via Twilio...");

    if (!window.currentVerifyingPhone) {
        alert("No phone number to verify");
        return;
    }

    const verifyButton = document.getElementById('verify-code-btn');
    if (verifyButton) {
        verifyButton.disabled = true;
        verifyButton.textContent = 'Verifying...';
    }

    try {
        const response = await fetch('/api/sms/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phoneNumber: window.currentVerifyingPhone,
                code: code,
                sentCode: window.currentSentCode // Send stored code for verification
            })
        });

        const data = await response.json();

        if (data.verified) {
            console.log("✅ Verified! User:", window.currentVerifyingPhone);
            if (typeof loginWithPhone === 'function') {
                loginWithPhone(window.currentVerifyingPhone);
            }
        } else {
            throw new Error(data.error || 'Invalid code');
        }
    } catch (error) {
        console.error("❌ Verification failed:", error);
        console.error(error.message || "Invalid code. Try again.");
        const statusDiv = document.getElementById("status-message");
        if (statusDiv) {
            statusDiv.textContent = error.message || "Invalid code. Try again.";
            statusDiv.style.color = "red";
        }

        if (verifyButton) {
            verifyButton.disabled = false;
            verifyButton.textContent = 'Verify';
        }
    }
};

console.log("✅ Twilio SMS Auth Ready");
