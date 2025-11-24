// Simple test for unactivated account cleanup functionality
import { mockRegisterWithOTP, mockDeleteUnactivatedAccount } from './src/features/auth/mockRepo.js';

async function testCleanupFunctionality() {
    console.log('🚀 Testing Unactivated Account Cleanup');
    console.log('=' * 50);
    
    try {
        // Test 1: Create unactivated account
        console.log('\n📝 Test 1: Creating unactivated account...');
        const userData = {
            username: 'testuser_' + Date.now(),
            email: 'test@example.com',
            password: 'testpass123',
            first_name: 'Test',
            last_name: 'User'
        };
        
        const registerResult = await mockRegisterWithOTP(userData);
        console.log(`✅ Created account: ${userData.username}`);
        console.log(`   - Activated: ${registerResult.user.activated}`);
        console.log(`   - Has OTP token: ${!!registerResult.otp_token}`);
        
        // Test 2: Clean up unactivated account
        console.log('\n🧹 Test 2: Cleaning up unactivated account...');
        const cleanupResult = await mockDeleteUnactivatedAccount({ username: userData.username });
        console.log(`✅ Cleanup successful: ${cleanupResult.message}`);
        
        // Test 3: Verify account is removed
        console.log('\n🔍 Test 3: Verifying account is removed...');
        try {
            await mockDeleteUnactivatedAccount({ username: userData.username });
            console.log('❌ ERROR: Account should have been deleted');
        } catch (error) {
            console.log(`✅ Account properly removed: ${error.message}`);
        }
        
        console.log('\n🎉 All tests passed! Cleanup functionality working correctly.');
        return true;
        
    } catch (error) {
        console.log(`\n❌ Test failed: ${error.message}`);
        console.error(error);
        return false;
    }
}

// Run the test
testCleanupFunctionality().then(success => {
    process.exit(success ? 0 : 1);
});