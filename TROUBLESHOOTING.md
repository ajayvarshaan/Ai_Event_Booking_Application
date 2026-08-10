# 🔧 Troubleshooting Guide

## ✅ Issue Fixed: TypeScript Types

The `@types/cors` package has been installed. You should now be able to run the backend.

---

## 🚀 Try Running Again

### Backend:
```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected
```

### Frontend:
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms
Local: http://localhost:3000
```

---

## ⚠️ Common Issues & Solutions

### 1. MongoDB Connection Error

**Error:** `MongoDB connection error`

**Solution:**
```bash
# Option A: Start local MongoDB
net start MongoDB

# Option B: Use MongoDB Atlas
# Update backend/.env with:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-booking
```

---

### 2. Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

---

### 3. TypeScript Compilation Errors

**Error:** `Cannot find module` or `Type errors`

**Solution:**
```bash
cd backend
npm install --save-dev @types/cors @types/express @types/node @types/bcryptjs @types/jsonwebtoken
```

---

### 4. Module Not Found

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Reinstall dependencies
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install

cd ../frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

---

### 5. Vite Not Found

**Error:** `Cannot find module 'vite'`

**Solution:**
```bash
cd frontend
npm install vite @vitejs/plugin-react --save-dev
npm install
```

---

### 6. CORS Errors in Browser

**Error:** `CORS policy: No 'Access-Control-Allow-Origin'`

**Solution:**
- Backend already has CORS enabled
- Make sure backend is running on port 5000
- Check `frontend/src/services/api.ts` has correct baseURL

---

### 7. JWT Token Errors

**Error:** `jwt malformed` or `invalid token`

**Solution:**
```bash
# Clear browser localStorage
# In browser console:
localStorage.clear()

# Then login again
```

---

### 8. Google OAuth Error 400: origin_mismatch

**Error:** `Access blocked: Authorisation error - Error 400: origin_mismatch`

**Cause:** Google Cloud Console requires the exact URL origin of your frontend (`http://localhost:3000`) to be explicitly authorized in your Google Cloud Console OAuth Credentials.

**Solution:**
1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Select your Client ID: `1044175093023-sp3jkh8mrks61d4c3ioa3ike7nccgf4u.apps.googleusercontent.com` (or your custom Client ID).
3. Under **Authorized JavaScript origins**, click **+ ADD URI**.
4. Add:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
5. Save the changes (takes 1–5 minutes to take effect).

---

## 🔍 Verification Steps

### Check Backend:
```bash
# Test if backend is running
curl http://localhost:5000/api/events

# Or open in browser:
http://localhost:5000/api/events
```

### Check Frontend:
```bash
# Open in browser:
http://localhost:3000
```

### Check MongoDB:
```bash
# Connect to MongoDB
mongo

# Check database
use event-booking
show collections
db.users.find()
```

---

## 📋 Complete Reinstall (If Nothing Works)

```bash
# 1. Stop all servers (Ctrl+C in terminals)

# 2. Delete node_modules
cd backend
rmdir /s /q node_modules
del package-lock.json

cd ../frontend
rmdir /s /q node_modules
del package-lock.json

# 3. Reinstall everything
cd ../backend
npm install

cd ../frontend
npm install

# 4. Start again
cd ../backend
npm run dev

# In new terminal:
cd frontend
npm run dev
```

---

## 🆘 Still Having Issues?

### Check These:

1. **Node.js Version**
   ```bash
   node --version
   # Should be v18 or higher
   ```

2. **npm Version**
   ```bash
   npm --version
   # Should be v9 or higher
   ```

3. **MongoDB Status**
   ```bash
   sc query MongoDB
   # Should show RUNNING
   ```

4. **Ports Available**
   ```bash
   netstat -ano | findstr :3000
   netstat -ano | findstr :5000
   # Should be empty
   ```

5. **Environment Variables**
   - Check `backend/.env` exists
   - Check all values are set

---

## 📞 Quick Fixes

### Backend Won't Start:
```bash
cd backend
npm install --save-dev @types/cors @types/express @types/node
npm run dev
```

### Frontend Won't Start:
```bash
cd frontend
npm install
npm run dev
```

### MongoDB Won't Connect:
```bash
net start MongoDB
# Or use MongoDB Atlas connection string
```

---

## ✅ Success Indicators

### Backend Running Successfully:
```
Server running on port 5000
MongoDB Connected
```

### Frontend Running Successfully:
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:3000
```

### Application Working:
- Can access http://localhost:3000
- Can register a user
- Can login
- Can view events

---

## 🎉 All Fixed?

Once both servers are running, open:
```
http://localhost:3000
```

And start using your Event Booking System!

---

**Need more help? Check the other documentation files:**
- START_HERE.md
- HOW_TO_RUN.md
- COMPLETE_GUIDE.md
