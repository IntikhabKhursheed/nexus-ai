# MongoDB Setup Guide

## Current Issue
The server cannot connect to MongoDB Atlas because:
- ❌ The password in the connection string is incorrect OR
- ❌ Your IP is not whitelisted in MongoDB Atlas

## Step-by-Step Fix

### Step 1: Get Your MongoDB Atlas Password
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Log in with your account (intikhab)
3. Click on your project
4. Go to **Deployment** → **Database** → **NexusCluster**
5. Click **Connect**
6. Select **Drivers** → **Node.js**
7. Copy the connection string shown (it will have `<password>` placeholder)
8. Replace `<password>` with your actual database user password

### Step 2: URL Encode Special Characters (Important!)
If your password contains special characters like `@`, `#`, `$`, `%`, etc., they must be URL encoded:

- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `:` → `%3A`

Use this tool to encode: https://www.urlencoder.org/

**Example:**
- Password: `pass@word#123`
- Encoded: `pass%40word%23123`

### Step 3: Update .env File
Edit `d:\Programming\nexus-ai\server\.env` and replace:
```
MONGODB_URI=mongodb+srv://intikhab:<PASSWORD_HERE>@nexuscluster.j3neu3d.mongodb.net/nexusai?retryWrites=true&w=majority
```

With your actual password (URL encoded if needed):
```
MONGODB_URI=mongodb+srv://intikhab:yourPasswordHere@nexuscluster.j3neu3d.mongodb.net/nexusai?retryWrites=true&w=majority
```

### Step 4: Whitelist Your IP in MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to **Security** → **Network Access**
3. Click **Add IP Address**
4. Enter your IP or `0.0.0.0/0` (for development - allows any IP)
5. Click **Confirm**

To find your IP: https://www.whatismyipaddress.com/

### Step 5: Test the Connection
Run this command to test:
```bash
npx ts-node test-db-connection.ts
```

You should see:
```
✅ SUCCESS: Connected to MongoDB!
```

### Step 6: Restart the Server
Once connected, restart:
```bash
npm run dev
```

## Quick Checklist
- [ ] Found MongoDB password in Atlas
- [ ] URL encoded special characters (if any)
- [ ] Updated .env with correct password
- [ ] Added IP to Network Access whitelist
- [ ] Tested connection with `npx ts-node test-db-connection.ts`
- [ ] Restarted server with `npm run dev`

## Common Errors & Fixes

### Error: `querySrv ECONNREFUSED`
- Your IP is not whitelisted
- Add your IP to MongoDB Atlas Network Access

### Error: `authentication failed`
- Wrong password
- Special characters not URL encoded
- Database user doesn't have right permissions

### Error: `connect ECONNREFUSED`
- Cluster name incorrect
- Cluster is paused (wake it up in MongoDB Atlas)
