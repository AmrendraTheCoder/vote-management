# Vote Manager Backend API

Backend API for the Vote Manager application, ready for deployment on Vercel.

## 🚀 Quick Deploy to Vercel

### Prerequisites

- GitHub account
- Vercel account (free)
- MongoDB Atlas cluster (free tier available)

### Step 1: Prepare Repository

1. Push this backend code to a GitHub repository
2. Make sure the `.env` file is **NOT** committed (it's in `.gitignore`)

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the `backend` folder as the root directory
5. Vercel will automatically detect it's a Node.js project

### Step 3: Configure Environment Variables

In Vercel dashboard, add these environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://timepass11082003:HXtuq6J7FsWtBzF3@cluster0.4bktfmk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Step 4: Deploy

1. Click "Deploy"
2. Vercel will build and deploy your API
3. You'll get a URL like: `https://your-backend.vercel.app`

## 📡 API Endpoints

Once deployed, your API will be available at:

### Health Check

- `GET https://your-backend.vercel.app/api/health`

### Students

- `GET https://your-backend.vercel.app/api/students` - Get all students
- `POST https://your-backend.vercel.app/api/students` - Create student
- `PUT https://your-backend.vercel.app/api/students/:id` - Update student
- `DELETE https://your-backend.vercel.app/api/students/:id` - Delete student

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## 📦 Environment Variables

Create a `.env` file with:

```env
NODE_ENV=development
PORT=5001
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Security**: Helmet, CORS, Rate Limiting
- **Deployment**: Vercel (Serverless Functions)

## 🔒 Security Features

- CORS configuration for specific origins
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- Security headers via Helmet
- Environment-based error reporting

## 📊 Database Schema

### Student Model

```javascript
{
  name: String (required, max 100 chars)
  roomNumber: String (required, max 20 chars)
  vote: String (enum: '', 'Yes', 'No', 'Undecided', 'Absent')
  createdAt: Date
  updatedAt: Date
}
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Update `FRONTEND_URL` in environment variables
2. **Database Connection**: Verify MongoDB Atlas connection string
3. **Rate Limiting**: Check if you're exceeding API limits

### Debug Steps

1. Check Vercel function logs
2. Test API endpoints with curl or Postman
3. Verify environment variables are set correctly

## 📈 Performance

- **Serverless**: Automatically scales with demand
- **Global CDN**: Fast response times worldwide
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient database connections

## 🔄 Updates

To update your deployment:

1. Push changes to GitHub
2. Vercel automatically redeploys
3. Check deployment status in Vercel dashboard

---

**Ready for production deployment! 🚀**
