# Vote Manager App

A modern, mobile-first web application for tracking student votes and support for Chirag Sir. Features a responsive design that works seamlessly on both desktop and mobile devices, with full database integration for centralized data management.

## ✨ Features

### 📱 Mobile-First Design

- **Responsive Layout**: Automatically adapts between desktop table view and mobile card view
- **Touch-Friendly**: Large buttons and input fields optimized for mobile interaction
- **Offline Support**: Works offline with local storage fallback
- **Connection Status**: Real-time online/offline indicator

### 🗄️ Database Integration

- **Centralized Data**: All data stored in MongoDB for multi-user access
- **Real-time Sync**: Automatic synchronization between devices
- **Data Persistence**: No data loss between sessions
- **Export Functionality**: CSV export for external analysis

### 🎯 Core Functionality

- **Student Management**: Add, edit, and remove students
- **Vote Tracking**: Track support status (Yes/No/Undecided/Absent)
- **Live Statistics**: Real-time vote counting and percentages
- **Room Number Tracking**: Associate students with their room numbers

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd timepass-code
npm install
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
npm run dev
```

### 3. Frontend Setup

```bash
# In project root
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5174
- Backend API: http://localhost:5001/api

## 📱 Mobile Experience

### Desktop (Large Screens)

- Traditional table layout with all data visible at once
- Quick editing with inline inputs
- Bulk operations support

### Mobile & Tablet

- Card-based layout for better touch interaction
- Larger input fields and buttons
- Intuitive navigation and editing
- Swipe-friendly interface

## 🛠️ Technology Stack

### Frontend

- **React 19** - Modern UI framework
- **Tailwind CSS 4** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Vite** - Fast development build tool

### Backend

- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database and ODM
- **CORS & Helmet** - Security middleware
- **Rate Limiting** - API protection

## 🎨 Design Features

### Responsive Breakpoints

- `xs` (375px+): Mobile phones
- `sm` (640px+): Large phones / small tablets
- `md` (768px+): Tablets
- `lg` (1024px+): Laptops / desktops

### Color Scheme

- **Primary**: Blue gradient (blue-600 to indigo-600)
- **Success**: Green tones for positive votes
- **Warning**: Yellow tones for undecided votes
- **Danger**: Red tones for negative votes
- **Neutral**: Gray tones for UI elements

## 📊 API Endpoints

### Students

- `GET /api/students` - Get all students with statistics
- `POST /api/students` - Create a new student
- `PUT /api/students/:id` - Update a student
- `DELETE /api/students/:id` - Delete a student
- `POST /api/students/bulk` - Create multiple students
- `GET /api/students/stats` - Get voting statistics

### Health Check

- `GET /api/health` - Check API status

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:

- Traditional VPS deployment
- Docker containerization
- Cloud platform deployment (Vercel + Railway)
- MongoDB Atlas setup
- Security considerations

## 📱 Mobile App Features

### Offline Mode

- **Local Storage**: Data cached locally for offline use
- **Sync on Connect**: Automatic sync when connection restored
- **Visual Indicators**: Clear online/offline status display

### Touch Optimizations

- **Large Touch Targets**: 44px minimum for accessibility
- **Gesture Support**: Intuitive swipe and tap interactions
- **Visual Feedback**: Button states and loading indicators

### Performance

- **Lazy Loading**: Efficient data loading
- **Debounced Updates**: Optimized API calls
- **Cached Responses**: Reduced load times

## 🔧 Development

### Project Structure

```
/
├── src/
│   ├── components/
│   │   └── VoteManager.jsx     # Main application component
│   ├── services/
│   │   └── api.js              # API service layer
│   └── ...
├── backend/
│   ├── models/
│   │   └── Student.js          # MongoDB schema
│   ├── routes/
│   │   └── students.js         # API routes
│   └── server.js               # Express server
└── ...
```

### Environment Variables

**Frontend (.env)**

```
VITE_API_URL=http://localhost:5001/api
VITE_NODE_ENV=development
```

**Backend (backend/.env)**

```
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/vote_manager
FRONTEND_URL=http://localhost:5174
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both desktop and mobile
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and support:

1. Check the [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section
2. Review the API health endpoint: `/api/health`
3. Check browser console for client-side errors
4. Review server logs for backend issues

---

**Built with ❤️ for better vote management and mobile-first experience**

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
