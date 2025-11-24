# 🛠️ Real Backend Testing Guide

## 🎯 **Setup**: Backend đã được re-enabled

```bash
# File: .env - CẬP NHẬT
VITE_API_BASE_URL=http://localhost:8000
# ✅ Vite đã restart - Ready for real backend testing
```

---

## 🔧 **BƯỚC 1: Clear LocalStorage (CRITICAL)**

**MUST DO** - Để tránh lỗi mock tokens cũ:

### Step-by-step:
1. **Mở DevTools**: F12 → Application tab
2. **Navigate**: Storage → Local Storage → http://localhost:5174
3. **DELETE ALL KEYS**:
   - `auth.tokens.v1` ← **MOST IMPORTANT**
   - `otp_token` ← **IF EXISTS**
   - Any other auth-related keys

### Quick Method:
```javascript
// Mở Console trong DevTools và chạy:
localStorage.clear();
console.log('✅ LocalStorage cleared');
```

---

## 🧪 **BƯỚC 2: Test Backend Registration**

### Expected Request Flow:
1. **Go to**: http://localhost:5174/signup
2. **Fill form**:
   ```
   Username: testuser123
   Email: test@example.com
   Password: password123
   First Name: John
   Last Name: Doe
   ```
3. **Submit** → Sẽ gọi `POST http://localhost:8000/auth/register`

### Expected Result:
- **Success**: `HTTP 200` → Registration successful
- **If 404**: Backend chưa implement `/auth/register`  
- **If 400**: Validation error (check request format)
- **If CORS**: Backend cần enable CORS

---

## 📡 **Test Backend Directly First**

### Before testing frontend, verify backend:
```bash
# Test 1: Backend health
curl http://localhost:8000/health

# Test 2: Registration endpoint
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "test@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Tài khoản đã được tạo. Vui lòng kiểm tra email để xác minh OTP.",
  "otp_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser123",
    "email": "test@example.com",
    "role": "user",
    "first_name": "John",
    "last_name": "Doe",
    "activated": false,
    "is_authenticated": false
  }
}
```

---

## 🚨 **Troubleshooting**

### If still get 401/refresh loop:
1. **Clear localStorage** (Step 1 above)
2. **Hard refresh**: Ctrl+Shift+R
3. **Restart Vite**: `npm run dev`

### If get 404:
- Backend chưa implement endpoint `/auth/register`
- Check backend implementation

### If get CORS:
- Backend cần add CORS policy cho frontend domain

---

## 🎯 **Test Flow Summary**

1. ✅ Backend running → `curl http://localhost:8000/health`
2. ✅ Backend registration works → Direct curl test
3. ✅ Clear localStorage → Remove old tokens
4. ✅ Test frontend → Navigate to /signup → Submit form
5. ✅ Monitor console → No more infinite refresh loop

---

**Ready for Real Backend Testing!** 🚀