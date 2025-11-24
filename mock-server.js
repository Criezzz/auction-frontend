import http from 'http';
import url from 'url';

const PORT = 8000;
const FRONTEND_ORIGIN = 'http://localhost:5173';

// CORS Headers - Properly configured for credentials
const corsHeaders = {
  'Access-Control-Allow-Origin': FRONTEND_ORIGIN, // Specific origin, not wildcard
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  'Access-Control-Max-Age': '86400'
};

// Mock data
let users = [];
let auctions = [];
let tokens = new Map();
let otpTokens = new Map();

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateOTP() {
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

function getCurrentPort() {
  return '5173'; // Assuming Vite default port
}

// Create server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${path}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  // Set CORS headers for all responses
  res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });

  try {
    // Auth Routes
    if (path === '/auth/register' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const { username, email, password, first_name, last_name } = data;

          // Validate required fields
          if (!username || !email || !password) {
            res.writeHead(400, corsHeaders);
            res.end(JSON.stringify({
              success: false,
              message: 'Missing required fields'
            }));
            return;
          }

          // Check if user already exists
          if (users.find(u => u.username === username || u.email === email)) {
            res.writeHead(400, corsHeaders);
            res.end(JSON.stringify({
              success: false,
              message: 'Username or email already exists'
            }));
            return;
          }

          // Create new user
          const newUser = {
            id: users.length + 1,
            username,
            email,
            password, // In real app, this would be hashed
            first_name: first_name || '',
            last_name: last_name || '',
            role: 'user',
            activated: false,
            is_authenticated: false,
            created_at: new Date().toISOString()
          };

          users.push(newUser);

          // Generate OTP token for verification
          const otpToken = generateToken();
          const otpCode = generateOTP();
          
          otpTokens.set(otpToken, {
            userId: newUser.id,
            otp: otpCode,
            email: email,
            expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
          });

          console.log(`Generated OTP for ${email}: ${otpCode}`);

          res.writeHead(201, corsHeaders);
          res.end(JSON.stringify({
            success: true,
            message: 'Tài khoản đã được tạo. Vui lòng kiểm tra email để xác minh OTP.',
            otp_token: otpToken,
            user: {
              id: newUser.id,
              username: newUser.username,
              email: newUser.email,
              role: newUser.role,
              first_name: newUser.first_name,
              last_name: newUser.last_name,
              activated: newUser.activated,
              is_authenticated: newUser.is_authenticated
            }
          }));

        } catch (error) {
          res.writeHead(400, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid JSON data'
          }));
        }
      });
      return;
    }

    // OTP Verification Route
    if (path === '/auth/verify-otp' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const { otp_token, otp_code } = data;

          if (!otp_token || !otp_code) {
            res.writeHead(400, corsHeaders);
            res.end(JSON.stringify({
              success: false,
              message: 'OTP token and code are required'
            }));
            return;
          }

          const otpData = otpTokens.get(otp_token);
          if (!otpData) {
            res.writeHead(400, corsHeaders);
            res.end(JSON.stringify({
              success: false,
              message: 'Invalid or expired OTP token'
            }));
            return;
          }

          // Check expiration
          if (Date.now() > otpData.expiresAt) {
            otpTokens.delete(otp_token);
            res.writeHead(400, corsHeaders);
            res.end(JSON.stringify({
              success: false,
              message: 'OTP has expired'
            }));
            return;
          }

          // Verify OTP
          if (otpData.otp !== otp_code) {
            res.writeHead(400, corsHeaders);
            res.end(JSON.stringify({
              success: false,
              message: 'Invalid OTP code'
            }));
            return;
          }

          // Activate user
          const userIndex = users.findIndex(u => u.id === otpData.userId);
          if (userIndex !== -1) {
            users[userIndex].activated = true;
            users[userIndex].is_authenticated = true;
          }

          // Clean up OTP token
          otpTokens.delete(otp_token);

          // Generate session tokens
          const accessToken = generateToken();
          const refreshToken = generateToken();
          
          tokens.set(accessToken, {
            userId: otpData.userId,
            refreshToken,
            expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
          });

          res.writeHead(200, corsHeaders);
          res.end(JSON.stringify({
            success: true,
            message: 'Email verified successfully!',
            tokens: {
              access_token: accessToken,
              refresh_token: refreshToken,
              token_type: 'Bearer',
              expires_in: 900
            },
            user: users[userIndex]
          }));

        } catch (error) {
          res.writeHead(400, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid JSON data'
          }));
        }
      });
      return;
    }

    // Login Route
    if (path === '/auth/login' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const { username, password } = data;

          const user = users.find(u => u.username === username && u.password === password);
          
          if (!user) {
            res.writeHead(401, corsHeaders);
            res.end(JSON.stringify({
              success: false,
              message: 'Invalid credentials'
            }));
            return;
          }

          if (!user.activated) {
            res.writeHead(400, corsHeaders);
            res.end(JSON.stringify({
              success: false,
              message: 'Account not verified. Please verify your email first.'
            }));
            return;
          }

          // Generate tokens
          const accessToken = generateToken();
          const refreshToken = generateToken();
          
          tokens.set(accessToken, {
            userId: user.id,
            refreshToken,
            expiresAt: Date.now() + (15 * 60 * 1000)
          });

          res.writeHead(200, corsHeaders);
          res.end(JSON.stringify({
            success: true,
            message: 'Login successful',
            tokens: {
              access_token: accessToken,
              refresh_token: refreshToken,
              token_type: 'Bearer',
              expires_in: 900
            },
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
              first_name: user.first_name,
              last_name: user.last_name,
              activated: user.activated,
              is_authenticated: true
            }
          }));

        } catch (error) {
          res.writeHead(400, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid JSON data'
          }));
        }
      });
      return;
    }

    // Get Auctions
    if (path === '/auctions' && method === 'GET') {
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        data: auctions,
        total: auctions.length
      }));
      return;
    }

    // Health check
    if (path === '/health' && method === 'GET') {
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Mock server is running with proper CORS configuration'
      }));
      return;
    }

    // 404 Not Found
    res.writeHead(404, corsHeaders);
    res.end(JSON.stringify({
      success: false,
      message: `Endpoint ${method} ${path} not found`
    }));

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({
      success: false,
      message: 'Internal server error'
    }));
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Mock Server running on http://localhost:${PORT}`);
  console.log(`📍 Frontend Origin: ${FRONTEND_ORIGIN}`);
  console.log(`🔒 CORS properly configured for credentials`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST /auth/register  - User registration');
  console.log('  POST /auth/verify-otp - Email verification');
  console.log('  POST /auth/login     - User login');
  console.log('  GET  /auctions       - Get auctions');
  console.log('  GET  /health         - Health check');
  console.log('');
  console.log('💡 Test signup flow:');
  console.log('1. Open http://localhost:5173/signup');
  console.log('2. Fill form and submit');
  console.log('3. Check server logs for OTP code');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});