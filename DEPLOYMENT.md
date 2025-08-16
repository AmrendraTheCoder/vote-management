# Vote Manager App - Deployment Guide

## Local Development Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Frontend Setup

1. Navigate to the project root
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file:
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_NODE_ENV=development
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/vote_manager
   FRONTEND_URL=http://localhost:5173
   ```
4. Start backend server:
   ```bash
   npm run dev
   ```

## Production Deployment

### Option 1: Traditional VPS/Server Deployment

#### Backend Deployment

1. **Server Setup**:

   - Ubuntu/CentOS server with Node.js and MongoDB
   - Install PM2 for process management:
     ```bash
     npm install -g pm2
     ```

2. **Environment Configuration**:

   ```bash
   # /backend/.env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/vote_manager
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Start Backend**:

   ```bash
   cd backend
   npm install --production
   pm2 start server.js --name "vote-manager-api"
   pm2 startup
   pm2 save
   ```

4. **Nginx Configuration**:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### Frontend Deployment

1. **Build Frontend**:

   ```bash
   # Update .env for production
   VITE_API_URL=https://api.yourdomain.com/api
   VITE_NODE_ENV=production

   npm run build
   ```

2. **Nginx Configuration**:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/vote-manager/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:5000;
       }
   }
   ```

### Option 2: Docker Deployment

#### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  mongodb:
    image: mongo:7
    container_name: vote-manager-db
    restart: unless-stopped
    environment:
      MONGO_INITDB_DATABASE: vote_manager
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    container_name: vote-manager-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://mongodb:27017/vote_manager
      FRONTEND_URL: https://yourdomain.com
    depends_on:
      - mongodb
    ports:
      - "5000:5000"

  frontend:
    build: .
    container_name: vote-manager-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

#### Frontend Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Option 3: Cloud Platform Deployment

#### Vercel (Frontend) + Railway/Render (Backend)

**Frontend on Vercel**:

1. Connect GitHub repository to Vercel
2. Set environment variables:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_NODE_ENV`: production
3. Deploy automatically on push

**Backend on Railway**:

1. Connect GitHub repository to Railway
2. Set environment variables:
   - `NODE_ENV`: production
   - `PORT`: 5000
   - `MONGODB_URI`: Your MongoDB connection string
   - `FRONTEND_URL`: Your Vercel domain
3. Deploy automatically on push

#### MongoDB Atlas (Recommended for Cloud)

1. Create MongoDB Atlas cluster
2. Get connection string
3. Update `MONGODB_URI` in backend environment

## Database Migration

### Initial Setup

The application will automatically create the necessary collections on first run.

### Data Import/Export

Export data:

```bash
mongoexport --db vote_manager --collection students --out students.json
```

Import data:

```bash
mongoimport --db vote_manager --collection students --file students.json
```

## Monitoring and Maintenance

### Logging

- Backend logs are handled by Morgan middleware
- Use PM2 logs for production: `pm2 logs vote-manager-api`

### Backup Strategy

1. **Database Backup**:

   ```bash
   mongodump --db vote_manager --out backup/$(date +%Y%m%d)
   ```

2. **Automated Backup Script**:

   ```bash
   #!/bin/bash
   BACKUP_DIR="/backups/vote-manager"
   DATE=$(date +%Y%m%d_%H%M%S)

   mkdir -p $BACKUP_DIR
   mongodump --db vote_manager --out $BACKUP_DIR/$DATE

   # Keep only last 7 days
   find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
   ```

### Health Monitoring

- Health check endpoint: `GET /api/health`
- Monitor with services like UptimeRobot or internal monitoring

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **CORS**: Configure proper CORS origins for production
3. **Rate Limiting**: Adjust rate limits based on usage
4. **MongoDB Security**: Use authentication in production
5. **HTTPS**: Always use HTTPS in production
6. **Input Validation**: Validate all user inputs
7. **Error Handling**: Don't expose sensitive information in errors

## Performance Optimization

1. **Database Indexing**: Already configured in the Student model
2. **Caching**: Consider Redis for session/data caching
3. **CDN**: Use CDN for static assets
4. **Compression**: Enable gzip compression in Nginx
5. **Database Connection Pooling**: MongoDB driver handles this automatically

## Troubleshooting

### Common Issues

1. **CORS Errors**:

   - Check `FRONTEND_URL` in backend `.env`
   - Verify CORS configuration in `server.js`

2. **Database Connection Issues**:

   - Verify `MONGODB_URI` format
   - Check MongoDB service status
   - Ensure network connectivity

3. **Build Failures**:

   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify environment variables

4. **API Not Responding**:
   - Check if backend server is running
   - Verify port configuration
   - Check firewall settings

### Debug Commands

```bash
# Check if services are running
pm2 status
systemctl status mongodb
systemctl status nginx

# View logs
pm2 logs vote-manager-api
tail -f /var/log/nginx/error.log

# Test API endpoint
curl http://localhost:5000/api/health
```
