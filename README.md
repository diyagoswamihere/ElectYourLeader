# Elect Your Leader - Voting Portal

A comprehensive voting portal system for electing leaders in various organizations (class, society, college, committee, etc.).

## Features

### Admin Portal
- Secure admin authentication
- Add and manage candidates with detailed information
- Upload candidate profile images and documents (PPT, PDF)
- Verify/unverify candidates
- Add and verify voters
- Real-time voting dashboard with graphical statistics
- View voting results with charts and graphs
- Track which candidate is leading

### Voter Portal
- Secure voter authentication
- View all verified candidates for their organization
- Access candidate information (agenda, goals, short/long-term plans)
- Download/view candidate documents
- Cast vote with confirmation modal
- View voting status
- One vote per voter (enforced)

## Technology Stack

- **Frontend:** React 18, React Router, Axios, Recharts
- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer

## Color Scheme

- Background: White (#ffffff) with grey undertone (#f5f5f5)
- Primary: Dark Green (#006400)
- Accent: Golden Yellow (#ffd700)
- Text: Dark (#333333) and Light Grey (#666666)

## Quick Start

See [HOW_TO_RUN.md](./HOW_TO_RUN.md) for detailed installation and setup instructions.

### Quick Commands

```bash
# Install all dependencies
npm run install-all

# Run both server and client
npm run dev

# Or run separately:
# Terminal 1: cd server && npm start
# Terminal 2: cd client && npm start
```

## Default Credentials (Development)

Credentials are **not displayed in the UI**.

- **Super Admin**
  - Email: `superadmin@example.com` (or `SUPER_ADMIN_EMAIL`)
  - Password: `superadmin123` (or `SUPER_ADMIN_PASSWORD`)
- **Admin**
  - Email: `admin@example.com` (or `DEFAULT_ADMIN_EMAIL`)
  - Password: `admin123` (or `DEFAULT_ADMIN_PASSWORD`)

⚠️ **Change these immediately in production!**

## Project Structure

```
ElectYourLeader/
├── server/              # Backend Express server
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API routes
│   └── uploads/         # Uploaded files
├── client/              # React frontend
│   ├── public/          # Public assets
│   └── src/             # Source code
│       ├── components/  # React components
│       └── context/     # React context
└── HOW_TO_RUN.md        # Detailed setup guide
```

## Security Features

- JWT-based authentication
- Role-based access control (Admin/Voter)
- Secure password hashing (bcrypt)
- Admin-only routes protection
- Voter verification system
- One vote per voter enforcement

## License

ISC

---

For detailed setup instructions, please refer to [HOW_TO_RUN.md](./HOW_TO_RUN.md)

