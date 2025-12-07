/**
 * Staff Management API Unit Tests
 * Tests username/password editing functionality
 */

const API_BASE = 'https://gourmet-bites.vercel.app/api';

// Test configuration
let testResults = [];
let testOwnerId = null;
let testStaffId = null;
const testUsername = `teststaff_${Date.now()}`;
const testPassword = 'testpass123';

// Helper function to make API calls
async function apiCall(endpoint, method, body = null, userId = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (userId) {
        headers['X-User-ID'] = userId;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    return { response, data };
}

// Test helper
function logTest(name, passed, details = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const message = `${status} - ${name}${details ? ': ' + details : ''}`;
    console.log(message);
    testResults.push({ name, passed, details });
    return passed;
}

// Test 1: Setup - Get owner ID for testing
async function test1_setup() {
    console.log('\n📋 Test 1: Setup - Get Owner ID');
    try {
        // Assume owner has ID 1 (from setup-auth.html)
        testOwnerId = '1';
        logTest('Setup', true, `Using owner ID: ${testOwnerId}`);
        return true;
    } catch (error) {
        logTest('Setup', false, error.message);
        return false;
    }
}

// Test 2: Create staff with username/password
async function test2_createStaff() {
    console.log('\n📋 Test 2: Create Staff with Username/Password');
    try {
        const { response, data } = await apiCall('/admin/users', 'POST', {
            display_name: 'Test Chef',
            email: 'testchef@example.com',
            phone: '+1234567890',
            username: testUsername,
            password: testPassword,
            role: 'chef',
            notes: 'Test staff account'
        }, testOwnerId);

        if (response.ok && data.id) {
            testStaffId = data.id;
            const hasUsername = data.username === testUsername;
            logTest('Create staff', hasUsername,
                hasUsername ? `Created staff ID: ${data.id}` : 'Username not returned');
            return hasUsername;
        } else {
            logTest('Create staff', false, data.error || 'Failed to create');
            return false;
        }
    } catch (error) {
        logTest('Create staff', false, error.message);
        return false;
    }
}

// Test 3: Verify username is returned in GET request
async function test3_getUsernameInGet() {
    console.log('\n📋 Test 3: GET Request Returns Username');
    try {
        const { response, data } = await apiCall('/admin/users', 'GET', null, testOwnerId);

        if (response.ok && data.users) {
            const testUser = data.users.find(u => u.id === testStaffId);
            const hasUsername = testUser && testUser.username === testUsername;
            logTest('GET returns username', hasUsername,
                hasUsername ? 'Username present in response' : 'Username missing from response');
            return hasUsername;
        } else {
            logTest('GET returns username', false, 'Failed to fetch users');
            return false;
        }
    } catch (error) {
        logTest('GET returns username', false, error.message);
        return false;
    }
}

// Test 4: Edit username
async function test4_editUsername() {
    console.log('\n📋 Test 4: Edit Username');
    const newUsername = testUsername + '_updated';
    try {
        const { response, data } = await apiCall('/admin/users', 'PUT', {
            id: testStaffId,
            username: newUsername
        }, testOwnerId);

        if (response.ok && data.username === newUsername) {
            logTest('Edit username', true, `Updated to: ${newUsername}`);
            return true;
        } else {
            logTest('Edit username', false, data.error || 'Update failed');
            return false;
        }
    } catch (error) {
        logTest('Edit username', false, error.message);
        return false;
    }
}

// Test 5: Duplicate username validation
async function test5_duplicateUsername() {
    console.log('\n📋 Test 5: Duplicate Username Validation');
    try {
        // Try to create another user with the same username
        const { response, data } = await apiCall('/admin/users', 'POST', {
            display_name: 'Another Chef',
            username: testUsername + '_updated', // Same as updated username
            password: 'anotherpass',
            role: 'chef'
        }, testOwnerId);

        const isDuplicate = !response.ok && data.error &&
            data.error.toLowerCase().includes('username');
        logTest('Duplicate username rejected', isDuplicate,
            isDuplicate ? 'Correctly rejected duplicate' : 'Should have rejected duplicate');
        return isDuplicate;
    } catch (error) {
        logTest('Duplicate username rejected', false, error.message);
        return false;
    }
}

// Test 6: Edit password
async function test6_editPassword() {
    console.log('\n📋 Test 6: Edit Password');
    const newPassword = 'newpass456';
    try {
        const { response, data } = await apiCall('/admin/users', 'PUT', {
            id: testStaffId,
            password: newPassword
        }, testOwnerId);

        if (response.ok) {
            logTest('Edit password', true, 'Password updated successfully');
            return true;
        } else {
            logTest('Edit password', false, data.error || 'Update failed');
            return false;
        }
    } catch (error) {
        logTest('Edit password', false, error.message);
        return false;
    }
}

// Test 7: Edit without changing password
async function test7_editWithoutPassword() {
    console.log('\n📋 Test 7: Edit Without Changing Password');
    try {
        const { response, data } = await apiCall('/admin/users', 'PUT', {
            id: testStaffId,
            display_name: 'Test Chef Updated',
            notes: 'Updated notes'
        }, testOwnerId);

        if (response.ok && data.display_name === 'Test Chef Updated') {
            logTest('Edit without password', true, 'Other fields updated, password unchanged');
            return true;
        } else {
            logTest('Edit without password', false, data.error || 'Update failed');
            return false;
        }
    } catch (error) {
        logTest('Edit without password', false, error.message);
        return false;
    }
}

// Test 8: Edit email and phone
async function test8_editEmailPhone() {
    console.log('\n📋 Test 8: Edit Email and Phone');
    try {
        const { response, data } = await apiCall('/admin/users', 'PUT', {
            id: testStaffId,
            email: 'updated@example.com',
            phone: '+9876543210'
        }, testOwnerId);

        if (response.ok) {
            // Verify by fetching
            const { data: userData } = await apiCall('/admin/users', 'GET', null, testOwnerId);
            const user = userData.users.find(u => u.id === testStaffId);
            const emailCorrect = user.google_email === 'updated@example.com';
            const phoneCorrect = user.phone_number === '+9876543210';
            const passed = emailCorrect && phoneCorrect;

            logTest('Edit email/phone', passed,
                passed ? 'Email and phone updated' : 'Email or phone not updated');
            return passed;
        } else {
            logTest('Edit email/phone', false, data.error || 'Update failed');
            return false;
        }
    } catch (error) {
        logTest('Edit email/phone', false, error.message);
        return false;
    }
}

// Test 9: Cleanup - Deactivate test user
async function test9_cleanup() {
    console.log('\n📋 Test 9: Cleanup - Deactivate Test User');
    try {
        const { response, data } = await apiCall('/admin/users', 'DELETE', {
            id: testStaffId
        }, testOwnerId);

        if (response.ok) {
            logTest('Cleanup', true, 'Test user deactivated');
            return true;
        } else {
            logTest('Cleanup', false, data.error || 'Deactivation failed');
            return false;
        }
    } catch (error) {
        logTest('Cleanup', false, error.message);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('🧪 Starting Staff Management Unit Tests\n');
    console.log('='.repeat(60));

    const tests = [
        test1_setup,
        test2_createStaff,
        test3_getUsernameInGet,
        test4_editUsername,
        test5_duplicateUsername,
        test6_editPassword,
        test7_editWithoutPassword,
        test8_editEmailPhone,
        test9_cleanup
    ];

    for (const test of tests) {
        await test();
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY\n');
    const passed = testResults.filter(r => r.passed).length;
    const total = testResults.length;
    const percentage = ((passed / total) * 100).toFixed(1);

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${total - passed} ❌`);
    console.log(`Success Rate: ${percentage}%\n`);

    if (passed === total) {
        console.log('🎉 ALL TESTS PASSED! 🎉');
    } else {
        console.log('⚠️  Some tests failed. Review the details above.');
    }
    console.log('='.repeat(60));

    return { passed, total, percentage, results: testResults };
}

// Export for Node.js or run in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runTests };
} else {
    // Auto-run in browser console
    if (typeof window !== 'undefined') {
        window.runStaffManagementTests = runTests;
        console.log('💡 To run tests, execute: runStaffManagementTests()');
    }
}
