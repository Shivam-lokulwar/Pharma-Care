PharmaCare Management System
A modern, full-stack pharmacy management system built with React, Node.js, Express.js, and MongoDB.
Manage medicines, sales, prescriptions, suppliers, and generate reports with real-time updates and a responsive dashboard.

🚀 Features
Frontend (React + JavaScript)
Modern dashboard with analytics
Medicine & Inventory Management
Sales Processing
Supplier & Category Management
Reports & Charts
User Authentication (Role-based)
Responsive UI with Tailwind CSS
Backend (Node.js + Express.js + MongoDB)
RESTful API with JWT authentication
MongoDB with Mongoose ODM
Real-time updates with Socket.IO
Input validation & error handling
Security with Helmet, bcrypt, rate limiting

🛠️ Tech Stack

Frontend: React 18, TypeScript, Tailwind CSS, React Router, Recharts, Socket.IO Client
Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Helmet, express-validator
Other: Socket.IO

📦 Installation
Prerequisites

Node.js (v16+)

MongoDB (local or Atlas)

Setup
# Clone repo
git clone <repository-url>
cd pharmacy-management-system

# Install dependencies
npm run install:all

Configure Environment

Backend (/server/.env)

MONGODB_URI=mongodb://localhost:27017/pharmacy_management
PORT=5000
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173


Frontend (/.env)

VITE_API_URL=http://localhost:5000/api

Seed Database (Sample data + Admin/Staff users)
npm run seed

Run Project
# Start both frontend & backend
npm run dev:full


Frontend: http://localhost:5173

Backend: http://localhost:5000/api

🔐 Default Login

Admin → admin / admin123

Staff → staff / staff123

📊 Modules

Dashboard: KPIs, sales trends, inventory alerts

Medicine Management: Inventory, expiry tracking, low stock alerts

Sales: POS interface, invoice generation, payment tracking

Prescriptions: Digital prescription, dispensing workflow

Reports: Sales, inventory, suppliers, CSV exports

Suppliers & Categories: Manage and track suppliers

🏗️ Project Structure
pharmacy-management-system/
├── src/            # Frontend (React)
├── server/         # Backend (Express + MongoDB)
├── public/         # Static assets
└── package.json    # Root config

🤝 Contributing

Fork the repo

Create a feature branch

Commit changes

Submit a pull request

📄 License

MIT License

✨ PharmaCare Management System – A modern, full-stack solution for pharmacy management with real-time features and secure workflows.
