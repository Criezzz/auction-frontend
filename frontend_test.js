// Frontend CORS Test Script - Run in browser console
// Copy và paste vào browser console của http://localhost:5173

(async function testCORS() {
    console.log('🧪 Testing CORS và API calls...');
    
    // Test với credentials
    const testData = {
        username: 'testuser123',
        email: 'testuser@example.com',
        password: '123456',
        first_name: 'Test',
        last_name: 'User'
    };
    
    console.log('📤 Sending registration request:', testData);
    
    try {
        const response = await fetch('http://localhost:8000/auth/register', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📥 Response Status:', response.status);
        console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('📥 Response Data:', data);
        
        if (response.ok) {
            console.log('✅ SUCCESS: Registration API hoạt động!');
        } else {
            console.log('❌ ERROR: Registration failed');
        }
        
    } catch (error) {
        console.error('💥 Fetch Error:', error.message);
        console.error('💥 Error Details:', error);
    }
    
    // Test OPTIONS preflight
    console.log('🛫 Testing CORS preflight...');
    try {
        const optionsResponse = await fetch('http://localhost:8000/auth/register', {
            method: 'OPTIONS',
            credentials: 'include',
            headers: {
                'Origin': 'http://localhost:5173',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        
        console.log('🛫 OPTIONS Response:', optionsResponse.status);
        console.log('🛫 OPTIONS Headers:', Object.fromEntries(optionsResponse.headers.entries()));
        
    } catch (error) {
        console.error('💥 OPTIONS Error:', error.message);
    }
})();