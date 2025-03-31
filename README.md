# Mecare - Healthcare Appointment Booking System

Mecare is a modern web application that allows users to book healthcare appointments, manage their medical profiles, and access healthcare services online. The application features a clean, user-friendly interface with role-based access control for both patients and administrators.

## Features

### For Patients
- User authentication with email and Google sign-in
- Profile management with personal and medical information
- Appointment booking system
- View appointment history
- Responsive design for mobile and desktop

### For Administrators
- Secure admin dashboard
- User management
- Appointment management
- Analytics and reporting
- System configuration

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Context API (for state management)

### Backend
- Node.js
- Express.js
- Postgres
- JWT Authentication
- Google OAuth

## Prerequisites

- Node.js (v18 or higher)
- Postgres
- Google OAuth credentials
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/caremate.git
cd caremate
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables as described above.

4. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server (in a new terminal)
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
mecare/
├── frontend/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable UI components
│   ├── context/            # React context providers
│   ├── lib/                # Utility functions
│   └── public/             # Static assets
└── backend/
    ├── controllers/        # Route controllers
    ├── models/            # Database models
    ├── routes/            # API routes
    ├── middleware/        # Custom middleware
    └── config/            # Configuration files
```

## Authentication

The application supports two authentication methods:
1. Email/Password authentication
2. Google OAuth authentication

Only users with email domains from `gmail.com` and `tothenew.com` are allowed to register.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
