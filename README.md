# PharmaCare - Pharmacy Management System

A comprehensive full-stack pharmacy management system built with React and Node.js, designed to streamline pharmacy operations including inventory management, sales tracking, prescription handling, and reporting.

## Features

### Core Functionality
- **Inventory Management**: Complete medicine inventory with stock tracking, expiry monitoring, and low-stock alerts
- **Sales Management**: Point-of-sale system with transaction tracking and customer management
- **Prescription Management**: Digital prescription handling with dispensing tracking
- **Supplier Management**: Vendor and supplier relationship management
- **Category Management**: Medicine categorization and organization
- **Dashboard Analytics**: Real-time insights and performance metrics
- **Reporting System**: Comprehensive reports for sales, inventory, and prescriptions
- **User Management**: Role-based access control (Admin/Staff)
- **Notifications**: Real-time alerts for stock levels, expiries, and system events

### Technical Features
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Real-time Updates**: Live data synchronization across the application
- **Data Validation**: Comprehensive input validation and error handling
- **Security**: JWT authentication, rate limiting, and data sanitization
- **Scalability**: Modular architecture for easy expansion
- **Performance**: Optimized queries and efficient data handling

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **JavaScript (ES6+)** - No TypeScript dependencies
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Recharts** - Data visualization and charts
- **Lucide React** - Modern icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Express Validator** - Input validation
- **Bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

##  Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **MongoDB** (v4.4 or higher)

##  Quick Start

### 1. Clone the Repository

git clone <repository-url>
cd pharmaCare

### 2. Install Dependencies

# Install all dependencies (frontend + backend)
npm run install:all

# Or install separately
npm install                    # Frontend dependencies
cd server && npm install       # Backend dependencies

### 3. Environment Setup

Create environment files:

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=PharmaCare Management System
```

**Backend (server/.env)**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/pharmacy_management

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# Frontend URL
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
# or
mongod
```

### 5. Seed Database (Optional)
```bash
cd server
npm run seed
```

### 6. Start the Application

**Option 1: Start both frontend and backend together**
```bash
npm run dev:full
```

**Option 2: Start separately**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### 7. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

##  Default Login Credentials

The application comes with pre-configured demo accounts:

### Admin Account
- **Username**: admin
- **Password**: admin123
- **Role**: Administrator
- **Permissions**: Full access to all features

### Staff Account
- **Username**: staff
- **Password**: staff123
- **Role**: Staff
- **Permissions**: Limited access to certain features

##  Project Structure

```
pharmaCare/
├── project/
│   ├── src/                    # Frontend source code
│   │   ├── components/         # React components
│   │   │   ├── Auth/          # Authentication components
│   │   │   ├── Dashboard/     # Dashboard components
│   │   │   └── Layout/        # Layout components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── utils/             # Utility functions
│   │   └── constants/         # Constants and types
│   ├── server/                # Backend source code
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Express middleware
│   │   └── scripts/           # Utility scripts
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration
└── README.md                  # This file
```

## Available Scripts

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Scripts
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run seed         # Seed database with sample data
npm run test         # Run tests
npm run lint         # Run ESLint
```

### Combined Scripts
```bash
npm run dev:full     # Start both frontend and backend
npm run build:full   # Build frontend and install production backend deps
npm run install:all  # Install all dependencies
```

## 🔧 Configuration

### Database Configuration
The application uses MongoDB as the primary database. Make sure to:
1. Install MongoDB on your system
2. Start the MongoDB service
3. Update the `MONGODB_URI` in your environment variables

### API Configuration
- Default API port: 5000
- CORS is configured to allow requests from the frontend
- Rate limiting is enabled to prevent abuse

### Frontend Configuration
- Default frontend port: 5173
- Vite is used for fast development and building
- Tailwind CSS is configured for styling

##  Deployment

### Frontend Deployment
```bash
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Backend Deployment
```bash
cd server
npm install --production
npm start
# Deploy to your server (Heroku, AWS, DigitalOcean, etc.)
```

### Environment Variables for Production
Make sure to set the following environment variables in production:
- `MONGODB_URI` - Your production MongoDB connection string
- `JWT_SECRET` - A strong, unique secret key
- `NODE_ENV=production`
- `CLIENT_URL` - Your production frontend URL

##  Testing

### Run Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests (if configured)
npm test
```

## Features Overview

### Dashboard
- Real-time statistics and metrics
- Sales analytics with charts
- Inventory status overview
- Alert notifications
- Quick action buttons

### Inventory Management
- Add, edit, and delete medicines
- Stock level monitoring
- Expiry date tracking
- Category-based organization
- Search and filtering

### Sales Management
- Point-of-sale interface
- Transaction history
- Customer management
- Payment tracking
- Receipt generation

### Prescription Management
- Digital prescription entry
- Medicine dispensing tracking
- Doctor information management
- Patient records
- Prescription status tracking

### Reporting
- Sales reports
- Inventory reports
- Prescription reports
- Supplier reports
- Custom date range filtering

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- [ ] Barcode scanning for medicines
- [ ] Mobile app development
- [ ] Advanced analytics and AI insights
- [ ] Integration with external pharmacy systems
- [ ] Multi-location support
- [ ] Advanced reporting and export features
- [ ] Email notifications
- [ ] Backup and restore functionality

##  Acknowledgments

- React team for the amazing framework
- MongoDB team for the database solution
- Tailwind CSS for the utility-first CSS framework
- All open-source contributors who made this project possible

---

**PharmaCare Management System** - Streamlining pharmacy operations with modern technology.