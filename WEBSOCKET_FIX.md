# WebSocket Connection Fix - WebSocket Close Issue

## 🔴 The Problem
The WebSocket connection was closing immediately because:
1. ❌ Django's default `python manage.py runserver` doesn't properly support WebSocket
2. ❌ JWT token authentication was failing silently
3. ❌ Missing proper error logging to debug connection issues

## ✅ The Solution

### Step 1: Stop the Current Server
Stop any running `python manage.py runserver` process.

### Step 2: Run with Daphne (ASGI Server)
Instead of Django's default development server, use **Daphne** which properly supports WebSocket:

**Windows:**
```bash
cd server
daphne -b 0.0.0.0 -p 8000 server.asgi:application
```

**Or use the batch script:**
```bash
run_server.bat
```

**Mac/Linux:**
```bash
cd server
./run_server.sh
```

### Step 3: Restart React Frontend
In another terminal:
```bash
cd client
npm start
```

## 📊 Expected Output in Django Console

When a WebSocket connects, you should see:
```
🔥 CONNECT CALLED 🔥
Token: eyJhbGciOi...
Recipient ID: 2
✅ Authenticated user: 1
🔗 Joining room: chat_1_2
✅ WebSocket ACCEPTED for room: chat_1_2
```

## ❌ If Still Getting WebSocket Close Error

Check the browser console for one of these issues:

### Issue 1: "Invalid JWT Token"
```
❌ INVALID JWT TOKEN
```
**Fix:** The token might be expired. Log out and log back in to get a fresh token.

### Issue 2: "JWT TOKEN EXPIRED"
```
❌ JWT TOKEN EXPIRED
```
**Fix:** Increase token lifetime in `settings.py`:
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),  # Increased from 60 minutes
}
```

### Issue 3: "Missing token or recipient"
```
❌ Missing token or recipient
```
**Fix:** Ensure:
- You're logged in (token in localStorage)
- You've selected a chat user (recipient ID is set)

### Issue 4: "WebSocket CLOSED - Code: 1006"
```
❌ WebSocket CLOSED - Code: 1006, Reason: 
```
**Code 1006 = Abnormal Closure** - Usually means:
- Django crashed or isn't running
- Database connection failed
- Check Django console for errors

## 🔧 Troubleshooting Checklist

✅ Run server with **Daphne** (not `python manage.py runserver`)
✅ Database is running (MySQL on port 3306)
✅ User is logged in (check localStorage → "user" object)
✅ Token is fresh (not expired)
✅ Selected a chat partner before WebSocket connects
✅ Browser console shows "✅ WebSocket CONNECTED"
✅ Django console shows "✅ WebSocket ACCEPTED"

## 📝 Summary of Changes

1. **Improved Consumer Logging** - Better error messages to debug connection issues
2. **Enhanced React Logging** - Detailed WebSocket connection status in browser console
3. **Startup Scripts** - Easy way to run server with Daphne
4. **Proper Error Handling** - Initialize variables to prevent crashes

---

**Now test it:** Login → Go to Dashboard → Select a user → Start chatting! 🚀
