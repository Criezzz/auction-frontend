// Test script để kiểm tra OTP verification flow với live backend
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8000';

// Test đăng ký user mới
async function testRegistration() {
  console.log('🧪 Testing Live OTP Flow...\n');
  
  try {
    // 1. Register user mới
    console.log('1. Đang đăng ký user mới...');
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `testuser_${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'test123456',
        first_name: 'Test',
        last_name: 'User'
      })
    });
    
    const registerResult = await registerResponse.json();
    console.log('📋 Registration Response:', registerResult);
    
    if (registerResult.success && registerResult.otp_token) {
      // 2. Kiểm tra OTP token
      console.log('\n2. Kiểm tra OTP token status...');
      const statusResponse = await fetch(`${API_BASE}/auth/otp/status?otp_token=${registerResult.otp_token}`);
      const statusResult = await statusResponse.json();
      console.log('📋 OTP Status:', statusResult);
      
      // 3. Verify OTP
      console.log('\n3. Verifying OTP...');
      const verifyResponse = await fetch(`${API_BASE}/auth/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp_code: '123456', // Mock OTP code
          otp_token: registerResult.otp_token,
          username: registerResult.user.username
        })
      });
      
      const verifyResult = await verifyResponse.json();
      console.log('📋 Verification Result:', verifyResult);
      
      if (verifyResult.success) {
        console.log('✅ OTP Verification thành công!');
        return true;
      } else {
        console.log('❌ OTP Verification thất bại:', verifyResult.message);
        return false;
      }
    } else {
      console.log('❌ Registration thất bại:', registerResult.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Chạy test
testRegistration();