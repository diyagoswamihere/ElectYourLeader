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

## Project Structure

```
ElectYourLeader/
├── server/              # Backend Express server
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth middleware
│   ├── routes/          # API routes
│   └── uploads/         # Uploaded files
├── client/              # React frontend
   ├── public/          # Public assets
   └── src/             # Source code
       ├── components/  # React components
       └── context/     # React context
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


