# How to Run the Elect Your Leader Project

This document provides step-by-step instructions on how to set up and run the voting portal project.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

1. **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js) or **yarn**
3. A code editor (VS Code recommended)

## Project Structure

```
ElectYourLeader/
├── server/          # Backend (Express.js)
│   ├── config/      # Database configuration
│   ├── middleware/  # Authentication middleware
│   ├── routes/      # API routes
│   └── uploads/     # File uploads directory
├── client/          # Frontend (React.js)
│   ├── public/      # Public assets
│   └── src/         # React source code
└── package.json     # Root package.json
```

## Installation Steps

### Step 1: Install Dependencies

Open a terminal in the project root directory and run:

```bash
npm run install-all
```

This command will install dependencies for:
- Root project
- Backend server
- Frontend client

Alternatively, you can install them separately:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Set Up Environment Variables

1. Navigate to the `server` directory
2. Create a `.env` file (you can copy from `.env.example` if it exists)
3. Add the following content:

```
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important:** Change the `JWT_SECRET` to a strong, random string for production use.

### Step 3: Create Upload Directory

The server needs a directory to store uploaded files. Create it manually or it will be created automatically when you upload files:

```bash
# On Windows (PowerShell)
mkdir server\uploads\candidates

# On Linux/Mac
mkdir -p server/uploads/candidates
```

## Running the Project

### Option 1: Run Both Server and Client Together (Recommended)

From the project root directory, run:

```bash
npm run dev
```

This will start both the backend server (on port 5000) and the frontend client (on port 3000) simultaneously.

### Option 2: Run Server and Client Separately

**Terminal 1 - Start the Backend Server:**

```bash
cd server
npm start
```

Or for development with auto-reload:

```bash
cd server
npm run dev
```

The server will run on `http://localhost:5000`

**Terminal 2 - Start the Frontend Client:**

```bash
cd client
npm start
```

The client will run on `http://localhost:3000` and automatically open in your browser.

## Accessing the Application

1. Open your web browser
2. Navigate to `http://localhost:3000`
3. You will see the login page

## Default Admin Credentials

The system comes with a default admin account:

- **Email:** `admin@example.com`
- **Password:** `admin123`

**⚠️ Important:** Change this password immediately after first login in a production environment!

## First Time Setup

### For Admin:

1. Login with the default admin credentials
2. You'll be redirected to the Admin Dashboard
3. **Add Candidates:**
   - Click on "Candidates" in the navigation
   - Click "Add Candidate"
   - Fill in candidate details (name, organization, agenda, etc.)
   - Upload profile image and documents (optional)
   - Click "Add Candidate"
   - Verify the candidate by clicking "Verify" button

4. **Add and Verify Voters:**
   - Click on "Voters" in the navigation
   - Click "Add Voter" to register new voters
   - Fill in voter details (name, email, password, organization)
   - Click "Verify" next to each voter to allow them to vote

5. **View Dashboard:**
   - Click on "Dashboard" to see voting statistics
   - View charts and graphs showing voting results
   - See which candidate is leading

### For Voters:

1. Admin must first add and verify your account
2. Login with your voter credentials
3. You'll see all verified candidates for your organization
4. Review each candidate's information, agenda, and documents
5. Click "Vote for [Candidate Name]" button
6. Confirm your vote in the popup modal
7. Once voted, you cannot vote again

## Features Overview

### Admin Features:
- ✅ Secure admin login
- ✅ Add and manage candidates
- ✅ Upload candidate profile images and documents (PPT, PDF)
- ✅ Verify/unverify candidates
- ✅ Add and verify voters
- ✅ View real-time voting dashboard with charts
- ✅ See voting statistics and results
- ✅ Logout functionality

### Voter Features:
- ✅ Secure voter login
- ✅ View all verified candidates
- ✅ See candidate details (agenda, goals, plans)
- ✅ Download/view candidate documents
- ✅ Cast vote with confirmation
- ✅ View vote status
- ✅ Logout functionality

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use:

1. **For Server (port 5000):**
   - Change `PORT` in `server/.env` file
   - Update `proxy` in `client/package.json` to match

2. **For Client (port 3000):**
   - The React app will automatically suggest using port 3001
   - Or set `PORT=3001` in `client/.env` file

### Database Issues

If you encounter database errors:

1. Delete `server/database.sqlite` file
2. Restart the server (it will recreate the database)

### File Upload Issues

If file uploads fail:

1. Ensure `server/uploads/candidates` directory exists
2. Check file size (max 10MB)
3. Ensure file types are: PDF, PPT, PPTX, DOC, DOCX

### CORS Errors

If you see CORS errors:

1. Ensure the server is running on port 5000
2. Check that `client/package.json` has `"proxy": "http://localhost:5000"`

## Building for Production

To create a production build:

```bash
# Build the React app
cd client
npm run build

# The build folder will contain the optimized production files
# You can serve it with a static file server or integrate with your backend
```

## Security Notes

1. **Change Default Admin Password:** Immediately change the default admin password
2. **JWT Secret:** Use a strong, random JWT secret in production
3. **HTTPS:** Use HTTPS in production for secure data transmission
4. **Database:** Consider using PostgreSQL or MySQL for production instead of SQLite
5. **File Uploads:** Implement file size limits and virus scanning in production

## Technology Stack

- **Frontend:** React 18, React Router, Axios, Recharts
- **Backend:** Node.js, Express.js, SQLite3
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer
- **Styling:** CSS3 with custom color scheme

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure both server and client are running
4. Check that ports are not blocked by firewall

## Color Scheme

The application uses the following color scheme:
- **Background:** White (#ffffff) with grey undertone (#f5f5f5)
- **Primary:** Dark Green (#006400)
- **Accent:** Golden Yellow (#ffd700)
- **Text:** Dark (#333333) and Light Grey (#666666)

---

**Happy Voting!** 🗳️








