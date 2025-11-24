# Account Creation Flow - API v2.0 Implementation

## 📋 Overview
Tài liệu này mô tả quy trình tạo tài khoản mới đã được cập nhật để tuân thủ API specification v2.0 với OTP verification flow.

## 🔄 Flow Diagram
```
1. User visits /signup
   ↓
2. Fills registration form (username, email, password, first_name, last_name, phone, dob)
   ↓
3. Client-side validation
   ↓
4. Submit to POST /auth/register
   ↓
5. Store OTP token in localStorage
   ↓
6. Navigate to /otp-verification
   ↓
7. User enters 6-digit OTP code
   ↓
8. Submit to POST /auth/register/verify
   ↓
9. Success → Navigate to /otp-verification-success
   ↓
10. Auto-redirect to /signin after 3 seconds
```

## 📝 Form Fields Mapping

### Required Fields (API v2.0)
| Field | Type | Validation Rules | Required |
|-------|------|------------------|----------|
| `username` | string | 3-32 chars, alphanumeric + underscore | ✅ |
| `email` | string | Valid email format | ✅ |
| `password` | string | Minimum 6 characters | ✅ |
| `first_name` | string | 2-50 chars, Vietnamese characters allowed | ✅ |
| `last_name` | string | 2-50 chars, Vietnamese characters allowed | ✅ |

### Optional Fields
| Field | Type | Validation Rules | Required |
|-------|------|------------------|----------|
| `phone_num` | string | Vietnamese format (+84xxxxxxxxx) | ❌ |
| `date_of_birth` | date | Must be in past, age >= 13 | ❌ |

## 🔐 API Payload Structure

### Registration Request (`POST /auth/register`)
```javascript
{
  "username": "user123",
  "email": "user@example.com", 
  "password": "password123",
  "first_name": "Nguyen",
  "last_name": "Van A",
  "phone_num": "+84123456789", // optional
  "date_of_birth": "1990-01-01T00:00:00" // optional, ISO format
}
```

### Registration Response
```javascript
{
  "success": true,
  "message": "Tài khoản đã được tạo. Vui lòng kiểm tra email để xác minh OTP.",
  "otp_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 300,
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "role": "user",
    "first_name": "Nguyen",
    "last_name": "Van A",
    "phone_num": "+84123456789",
    "date_of_birth": "1990-01-01T00:00:00",
    "activated": false,
    "is_authenticated": false,
    "created_at": "2024-01-01T12:00:00",
    "updated_at": null
  }
}
```

### OTP Verification (`POST /auth/register/verify`)
```javascript
// Request
{
  "otp_code": "123456",
  "otp_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "user123"
}

// Success Response
{
  "success": true,
  "message": "Xác minh email thành công! Tài khoản đã được kích hoạt.",
  "remaining_trials": 5
}

// Failed Response
{
  "success": false,
  "message": "Mã OTP không đúng. Bạn còn 4 lần thử.",
  "remaining_trials": 4,
  "updated_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // New token with updated trials
}
```

## 🧪 Testing Guide

### 1. Unit Tests
- **Validation Functions**: Test all validation rules
- **API Functions**: Test register, verify, resend OTP functions
- **Mock Functions**: Test mock implementations

### 2. Integration Tests
- **Registration Flow**: Full flow from form submit to success
- **OTP Verification**: Test success/failure scenarios
- **Error Handling**: Network errors, invalid responses
- **Rate Limiting**: Test rate limiting behavior

### 3. E2E Tests
- **Happy Path**: Complete registration and verification
- **Invalid OTP**: Multiple wrong attempts
- **Token Expiration**: Test expired OTP handling
- **Resend OTP**: Test resend functionality

### 4. Test Data
- **Mock OTP Code**: `123456`
- **Valid Phone**: `+84123456789`, `0123456789`
- **Invalid Data**: Test all validation edge cases

## 📁 File Structure
```
src/
├── pages/
│   ├── SignUpPage.jsx              # Updated registration form
│   ├── OTPVerificationPage.jsx     # OTP input and verification
│   └── OTPVerificationSuccessPage.jsx # Success confirmation
├── features/auth/
│   ├── register.js                 # Updated with OTP support
│   └── mockRepo.js                 # Mock OTP implementation
├── utils/
│   └── validation.js               # Comprehensive validation
└── main.jsx                        # Updated routing
```

## 🔧 Configuration

### Environment Variables
- `VITE_API_BASE_URL`: Backend API base URL
- Mock mode: Automatically used when no API base URL

### Local Storage Keys
- `otp_token`: Temporary storage for OTP verification

## 📱 UI/UX Features

### SignUpPage
- **Real-time Validation**: Field validation as user types
- **Error Display**: Clear error messages for each field
- **Responsive Design**: Works on mobile and desktop
- **Loading States**: Shows loading during API calls

### OTPVerificationPage
- **Auto-submit**: Submits when 6 digits entered
- **Countdown Timer**: Shows remaining time
- **Resend Functionality**: Rate-limited resend button
- **Error Recovery**: Handles wrong OTP codes

### OTPVerificationSuccessPage
- **Success Confirmation**: Clear success message
- **Auto-redirect**: Redirects to signin after 3 seconds
- **Manual Actions**: Buttons for immediate actions
- **Feature Showcase**: Highlights app benefits

## 🚀 Deployment Notes

### Backward Compatibility
- Legacy `register()` function still works
- Old users can still sign in normally
- New fields are optional in backend

### Security Considerations
- OTP tokens stored in localStorage (temporary)
- Tokens cleared after successful verification
- Rate limiting implemented for OTP requests
- Input sanitization for all fields

### Performance
- Form validation optimized for real-time feedback
- Minimal API calls during registration
- Lazy loading of validation functions
- Efficient state management

## 📊 Metrics & Monitoring

### Success Metrics
- Registration completion rate
- OTP verification success rate
- Time to complete registration
- Error rates by field

### Logging
- Registration attempts
- OTP verification attempts
- Error conditions
- Performance metrics

## 🔮 Future Enhancements

### Short Term
- Email template customization
- SMS OTP option
- Social login integration
- Profile completion wizard

### Long Term
- Multi-factor authentication
- Account linking
- Advanced security features
- Biometric authentication support

---

## 🐛 Known Issues & Limitations

1. **Mock Environment**: Demo OTP code is always `123456`
2. **Email Service**: Not implemented (mock only)
3. **Rate Limiting**: Basic implementation in mock mode
4. **Accessibility**: Some ARIA labels need improvement

## 📞 Support

For issues or questions about this implementation:
- Check validation rules in `src/utils/validation.js`
- Review API specification in `API_ENDPOINTS_GUIDE.md`
- Test with mock data: OTP = `123456`