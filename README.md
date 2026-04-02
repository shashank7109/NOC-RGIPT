# RGIPT NOC Management Portal

A full-stack web application designed to digitize and streamline the No Objection Certificate (NOC) application and approval workflow for Rajiv Gandhi Institute of Petroleum Technology (RGIPT).

![RGIPT NOC Portal Overview](frontend/public/rgipt_logo.png)

## 📌 Overview

The NOC Portal replaces the traditional, manual, paper-based requisition process with a seamless digital platform. It connects four distinct user roles—Students, Department Officers, the TNP Head, and System Administrators—into a unified, transparent pipeline. 

Students can submit their internship/NOC details, attach necessary documents (Offer Letters, Statements of Objective), and track their approval progress in real-time.

## 🚀 Key Features

*   **Role-Based Access Control (RBAC):** Secure JWT authentication supporting `Student`, `DeptOfficer`, `TNPHead`, and `Admin` access tiers.
*   **Domain-Restricted Registration:** Student registrations are strictly bound to official `@rgipt.ac.in` email addresses with OTP-based verification (via Nodemailer).
*   **Dynamic Workflow Engine:** Administrators can dynamically create departments and route NOC applications to specific faculty or HODs for initial review.
*   **Approval Pipeline:** Standardized flow: `Submitted` ➡️ `Department Review` ➡️ `TNP Head Review` ➡️ `Ready for Collection`.
*   **Premium UI/UX:** Built using modern Tailwind CSS (v4) with fully responsive split-screen authentication designs, glassmorphism navbars, and interactive dashboard cards.
*   **File Handling:** Secure multi-file uploads utilizing Multer for Offer Letters and Objective Statements.

## 🛠️ Technology Stack

*   **Frontend:** React.js (Vite), Tailwind CSS v4, React Router DOM, Axios
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB, Mongoose
*   **Authentication & Security:** JSON Web Tokens (JWT), bcrypt.js
*   **Mailing:** Nodemailer

## ⚙️ Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed, along with a running MongoDB instance.

### 1. Clone the Repository
```bash
git clone <repository_url>
cd "Noc Portal"
```

### 2. Backend Setup
Navigate to the backend directory, install packages, and set up your environment variables.
```bash
cd backend
npm install
```

Create a `.env` file in the root of the `backend` folder and configure the following:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/noc_portal
JWT_SECRET=your_super_secret_jwt_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=NOC_Portal@rgipt.ac.in
```

Start the backend server (using Nodemon for development):
```bash
npx nodemon index.js
```

### Render + UptimeRobot
If you deploy the backend on Render, add an UptimeRobot monitor to keep the service warm and verify uptime.

Use this monitor URL:
```text
https://<your-render-backend>.onrender.com/health
```

Recommended monitor settings:
- Monitor type: HTTP(s)
- Interval: 5 minutes
- Expected status code: 200

The endpoint returns a simple JSON payload and does not require authentication.

Render service settings:
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`

### 3. Frontend Setup
Open a new terminal tab, navigate to the frontend directory, and install dependencies.
```bash
cd frontend
npm install
```

Start the React development server:
```bash
npm run dev
```

### 4. Admin Initialization
1. Access the frontend locally at `http://localhost:5173`.
2. Register an account. The first registered account should ideally be manually elevated to an `Admin` via your database client (like MongoDB Compass) by changing the user's `role` to `Admin`.
3. Log in as the Admin and use the **System Administration** dashboard to create Departments and Assign Officer Roles using their respective email addresses.

## 📁 Project Structure

```text
Noc Portal/
├── backend/
│   ├── index.js          # Express server entry point
│   ├── routes/           # API Endpoints (Auth, Admin, Officer, Student)
│   ├── controllers/      # Route logic & Database interactions
│   ├── models/           # Mongoose schemas (User, Application, Department, RoutingConfig, ApplicationLog)
│   ├── middleware/       # JWT Auth verification & Multer config
│   ├── uploads/          # Student document storage (.gitignore)
│   └── utils/            # Helper functions (Nodemailer configuration)
└── frontend/
    ├── index.html        # Main HTML
    ├── vite.config.js
    └── src/
        ├── App.jsx       # Route provider
        ├── api.js        # Axios instance configured for backend
        ├── context/      # React global auth context
        ├── components/   # UI elements (Navbar, ProtectedRoutes)
        └── pages/        # Views (Login, Dashboards, Applications)
```

## 🔐 Security Considerations

*   Ensure the `uploads/` folder path is secure and restrict direct unauthorized static access where applicable.
*   Keep the `.env` file out of Version Control (included in `.gitignore`).
*   Always use App Passwords or robust SMTP relays for Nodemailer in a production environment.
