// Test file for unactivated account cleanup functionality
// Run with: node unactivated_account_cleanup_test.js

import { mockRegisterWithOTP, mockDeleteUnactivatedAccount } from './src/features/auth/mockRepo.js';

// Mock the console.log to avoid cluttering output
const originalLog = console.log;
console.log = () => {};

// Helper function to test cleanup scenarios
async function testCleanupScenario(scenarioName, setupFn, cleanupFn) {
    console.log(`\n=== Testing ${scenarioName} ===`);
    
    try {
        await setupFn();
        console.log(`✅ ${scenarioName}: Setup completed`);
        
        await cleanupFn();
        console.log(`✅ ${scenarioName}: Cleanup completed`);
        
        return true;
    } catch (error) {
        console.log(`❌ ${scenarioName}: Failed - ${error.message}`);
        return false;
    }
}

// Test 1: Cleanup unactivated account
async function testCleanupUnactivatedAccount() {
    console.log('\n--- Test 1: Cleanup Unactivated Account ---');
    
    // Create unactivated account
    const userData = {
        username: 'testuser_cleanup_' + Date.now(),
        email: 'test_cleanup@example.com',
        password: 'testpass123',
        first_name: 'Test',
        last_name: 'User'
    };
    
    // Register the account
    const registerResult = await mockRegisterWithOTP(userData);
    console.log(`Created unactivated account: ${userData.username}`);
    console.log(`Account activated: ${registerResult.user.activated}`);
    
    // Test cleanup
    const cleanupResult = await mockDeleteUnactivatedAccount({ username: userData.username });
    console.log(`Cleanup result: ${cleanupResult.message}`);
    
    // Verify account is removed
    try {
        await mockDeleteUnactivatedAccount({ username: userData.username });
        console.log('❌ ERROR: Account should have been deleted');
        return false;
    } catch (error) {
        console.log(`✅ Account properly removed: ${error.message}`);
        return true;
    }
}

// Test 2: Cannot cleanup activated account
async function testCannotCleanupActivatedAccount() {
    console.log('\n--- Test 2: Cannot Cleanup Activated Account ---');
    
    // Create unactivated account
    const userData = {
        username: 'testuser_activated_' + Date.now(),
        email: 'test_activated@example.com',
        password: 'testpass123',
        first_name: 'Test',
        last_name: 'User'
    };
    
    // Register the account
    await mockRegisterWithOTP(userData);
    console.log(`Created account: ${userData.username}`);
    
    // Simulate activation (in real scenario, this would be via OTP verification)
    // We'll access the users array from the module
    const { users } = await import('./src/features/auth/mockRepo.js');
    const user = users.find(u => u.username === userData.username);
    if (user) {
        user.activated = true;
        console.log(`Manually activated account for test: ${userData.username}`);
    }
    
    // Test cleanup should fail
    try {
        await mockDeleteUnactivatedAccount({ username: userData.username });
        console.log('❌ ERROR: Should not be able to delete activated account');
        return false;
    } catch (error) {
        console.log(`✅ Properly protected activated account: ${error.message}`);
        return true;
    }
}

// Test 3: OTP token cleanup
async function testOTPCleanup() {
    console.log('\n--- Test 3: OTP Token Cleanup ---');
    
    // Create unactivated account
    const userData = {
        username: 'testuser_otp_' + Date.now(),
        email: 'test_otp@example.com',
        password: 'testpass123',
        first_name: 'Test',
        last_name: 'User'
    };
    
    // Register the account
    const registerResult = await mockRegisterWithOTP(userData);
    const otpToken = registerResult.otp_token;
    console.log(`Created account with OTP token: ${otpToken.substring(0, 20)}...`);
    
    // Verify OTP token exists
    const { otpTokens } = await import('./src/features/auth/mockRepo.js');
    const tokenExists = otpTokens.has(otpToken);
    console.log(`OTP token exists before cleanup: ${tokenExists}`);
    
    // Cleanup account
    await mockDeleteUnactivatedAccount({ username: userData.username });
    
    // Verify OTP token is removed
    const tokenStillExists = otpTokens.has(otpToken);
    console.log(`OTP token exists after cleanup: ${tokenStillExists}`);
    
    if (!tokenStillExists) {
        console.log('✅ OTP token properly cleaned up');
        return true;
    } else {
        console.log('❌ OTP token not cleaned up');
        return false;
    }
}

// Test 4: Registration token cleanup
async function testRegistrationTokenCleanup() {
    console.log('\n--- Test 4: Registration Token Cleanup ---');
    
    // Create unactivated account
    const userData = {
        username: 'testuser_reg_' + Date.now(),
        email: 'test_reg@example.com',
        password: 'testpass123',
        first_name: 'Test',
        last_name: 'User'
    };
    
    // Register the account
    const registerResult = await mockRegisterWithOTP(userData);
    console.log(`Created account: ${userData.username}`);
    
    // Verify registration token exists
    const { registrationTokens } = await import('./src/features/auth/mockRepo.js');
    const tokenExists = registrationTokens.has(userData.username);
    console.log(`Registration token exists before cleanup: ${tokenExists}`);
    
    // Cleanup account
    await mockDeleteUnactivatedAccount({ username: userData.username });
    
    // Verify registration token is removed
    const tokenStillExists = registrationTokens.has(userData.username);
    console.log(`Registration token exists after cleanup: ${tokenStillExists}`);
    
    if (!tokenStillExists) {
        console.log('✅ Registration token properly cleaned up');
        return true;
    } else {
        console.log('❌ Registration token not cleaned up');
        return false;
    }
}

// Test 5: Concurrent cleanup attempts
async function testConcurrentCleanup() {
    console.log('\n--- Test 5: Concurrent Cleanup Attempts ---');
    
    // Create unactivated account
    const userData = {
        username: 'testuser_concurrent_' + Date.now(),
        email: 'test_concurrent@example.com',
        password: 'testpass123',
        first_name: 'Test',
        last_name: 'User'
    };
    
    // Register the account
    await mockRegisterWithOTP(userData);
    console.log(`Created account: ${userData.username}`);
    
    // Attempt cleanup multiple times concurrently
    const cleanupPromises = [
        mockDeleteUnactivatedAccount({ username: userData.username }),
        mockDeleteUnactivatedAccount({ username: userData.username }),
        mockDeleteUnactivatedAccount({ username: userData.username })
    ];
    
    try {
        const results = await Promise.allSettled(cleanupPromises);
        console.log(`Cleanup attempts: ${results.length}`);
        
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failureCount = results.filter(r => r.status === 'rejected').length;
        
        console.log(`Successful cleanups: ${successCount}`);
        console.log(`Failed cleanups: ${failureCount}`);
        
        if (successCount === 1 && failureCount === 2) {
            console.log('✅ Only one cleanup succeeded, others properly failed');
            return true;
        } else {
            console.log('❌ Unexpected cleanup behavior');
            return false;
        }
    } catch (error) {
        console.log(`❌ Concurrent cleanup test failed: ${error.message}`);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Unactivated Account Cleanup Tests');
    console.log('=' * 50);
    
    const tests = [
        {
            name: 'Cleanup Unactivated Account',
            fn: testCleanupUnactivatedAccount
        },
        {
            name: 'Cannot Cleanup Activated Account', 
            fn: testCannotCleanupActivatedAccount
        },
        {
            name: 'OTP Token Cleanup',
            fn: testOTPCleanup
        },
        {
            name: 'Registration Token Cleanup',
            fn: testRegistrationTokenCleanup
        },
        {
            name: 'Concurrent Cleanup Attempts',
            fn: testConcurrentCleanup
        }
    ];
    
    const results = [];
    
    for (const test of tests) {
        const result = await test.fn();
        results.push({
            name: test.name,
            passed: result
        });
    }
    
    // Summary
    console.log('\n' + '=' * 50);
    console.log('📊 TEST SUMMARY');
    console.log('=' * 50);
    
    const passedTests = results.filter(r => r.passed);
    const failedTests = results.filter(r => !r.passed);
    
    console.log(`✅ Passed: ${passedTests.length}/${results.length}`);
    console.log(`❌ Failed: ${failedTests.length}/${results.length}`);
    
    if (failedTests.length > 0) {
        console.log('\n❌ Failed Tests:');
        failedTests.forEach(test => {
            console.log(`   - ${test.name}`);
        });
    }
    
    if (passedTests.length === results.length) {
        console.log('\n🎉 All tests passed! Cleanup functionality working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please review the implementation.');
    }
    
    return passedTests.length === results.length;
}

// Export for manual testing
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

export {
    runAllTests,
    testCleanupUnactivatedAccount,
    testCannotCleanupActivatedAccount,
    testOTPCleanup,
    testRegistrationTokenCleanup,
    testConcurrentCleanup
};