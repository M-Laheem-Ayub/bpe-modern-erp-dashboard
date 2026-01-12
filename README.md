# Smart ERP System

A comprehensive, web-based Enterprise Resource Planning (ERP) system designed to streamline business processes. This solution integrates core business functions including Inventory Management, Order Processing, Human Resources, CRM, Procurement, and IT Support into a single, intuitive interface.

Built with the modern **MERN Stack** (MongoDB, Express.js, React.js, Node.js) and enhanced with **Vite** and **Tailwind CSS** for a responsive and performant user experience.

## 🚀 Features

The application is modular, containing specific dashboards for various departments:

*   **📊 Executive Dashboard**: Real-time overview of key business metrics, performance indicators, and recent activities.
*   **📦 Inventory Management**: Track stock levels, manage products, view low-stock alerts, and organize items by categories.
*   **🛒 Order Processing**: Manage customer orders, track status (Pending, Shipped, Delivered), and generate digital invoices.
*   **👥 HR & Recruitment**:
    *   **Recruitment**: Manage job postings, candidate applications, and hiring workflows.
    *   **Performance**: Conduct employee evaluations and track performance history.
    *   **Training**: Schedule and manage employee training sessions.
*   **🤝 CRM (Customer Relationship Management)**: Track leads, manage customer interactions, and monitor sales pipelines.
*   **🛍️ Procurement**: enhanced purchase request management and vendor tracking.
*   **🛠️ IT Support**: Ticket-based system for internal IT support requests and issue tracking.
*   **📣 Customer Complaints**: Dedicated module for logging and resolving customer issues.
*   **🔐 Secure Authentication**: Role-based access control (RBAC) with secure login, signup, and password recovery functionality.

## 🛠️ Technology Stack

### Frontend
*   **React.js** (v18): UI Library
*   **Vite**: Next Generation Frontend Tooling
*   **Tailwind CSS**: Utility-first CSS framework
*   **Lucide React**: Beautiful & consistent icons
*   **Axios**: Promise based HTTP client
*   **Recharts**: Composable charting library
*   **jsPDF & autoTable**: PDF generation for reports

### Backend
*   **Node.js**: JavaScript runtime environment
*   **Express.js**: Fast, unopinionated web framework
*   **MongoDB**: NoSQL database for flexible data storage
*   **Mongoose**: Object Data Modeling (ODM) library
*   **JWT (JSON Web Tokens)**: Secure user authentication
*   **Nodemailer**: Email sending service (for password resets/notifications)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)
*   [Git](https://git-scm.com/)

## ⚡ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/smart-erp-project.git
cd smart-erp-project
```

### 2. Backend Setup
Navigate to the root directory and install dependencies:
```bash
npm install
```

Create a `.env` file in the root directory and configure your environment variables:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_erp_db
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
FRONTEND_URL=http://localhost:5173
```
*Note: Replace `MONGO_URI` with your connection string if using MongoDB Atlas.*

Start the backend server:
```bash
node server.js
# OR for development with auto-reload
npm install -g nodemon
nodemon server.js
```
The server will start on `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd erp-frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```
The application will launch automatically in your browser (usually at `http://localhost:5173`).

## 📁 Project Structure

```
smart-erp-project/
├── controllers/        # Backend logic for handling requests
├── models/            # Mongoose database schemas
├── routes/            # API route definitions
├── middleware/        # Authentication and error handling middleware
├── server.js          # Backend entry point
│
└── erp-frontend/      # Frontend React Application
    ├── public/        # Static assets
    ├── src/
    │   ├── components/# Reusable UI components (Header, Sidebar, etc.)
    │   ├── context/   # React Context (Auth State)
    │   ├── pages/     # Main page views (Dashboard, Inventory, etc.)
    │   ├── api.js     # Axios configuration
    │   ├── App.jsx    # Main Layout and Routing
    │   └── main.jsx   # DOM Entry point
    └── vite.config.js # Vite configuration
```

## 🔒 Security Features
*   **JWT Authentication**: Stateless authentication mechanism.
*   **Password Hashing**: Passwords verified securely.
*   **Protected Routes**: Frontend routes guarded against unauthorized access.
*   **HTTP-Only Cookies** (Optional configuration supported).

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
