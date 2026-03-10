# 🎥 Video Streaming Platform

A full-stack **Video Streaming Platform** that allows users to record videos, upload them, stream them, and store them locally or in **Google Drive**.
The project is built using the **MERN stack (MongoDB, Express, React, Node.js)** and supports video recording, uploading, viewing, commenting, and user authentication.

---

# 🚀 Features

### User Features

* User registration and login
* Record video directly from the browser
* Upload video files
* Watch uploaded videos
* Search videos
* Comment on videos
* Subscribe to channels
* User profile page

### Video Features

* Video upload
* Video streaming player
* Video thumbnails
* Video categories
* Video metadata (title, description, duration)

### Storage

* Local storage for uploaded videos
* Optional **Google Drive integration** for cloud storage

### Authentication

* Secure login using **JWT**
* Protected API routes

---

# 🏗 Project Architecture

```
Client (React)
     ↓
REST API (Node.js + Express)
     ↓
MongoDB Database
     ↓
Storage
 ├── Local uploads
 └── Google Drive
```

---

# 📁 Project Structure

```
video-streaming-platform
│
├── client
│   ├── public
│   └── src
│       ├── components
│       ├── pages
│       ├── contexts
│       ├── utils
│       ├── App.js
│       └── index.js
│
├── server
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   └── index.js
│   │
│   ├── uploads
│   └── .env
│
└── README.md
```

---

# 🛠 Tech Stack

### Frontend

* React
* Material UI
* Axios
* React Router

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Multer (file uploads)

### Cloud Integration

* Google Drive API

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/video-streaming-platform.git
cd video-streaming-platform
```

---

## 2️⃣ Install Dependencies

### Client

```bash
cd client
npm install
```

### Server

```bash
cd server
npm install
```

---

## 3️⃣ Setup Environment Variables

Create `.env` inside the **server folder**.

Example:

```
PORT=5000
MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

---

## 4️⃣ Start the Application

Start backend server:

```bash
cd server
npm run dev
```

Start frontend:

```bash
cd client
npm start
```

---

# 🌐 API Endpoints

### Authentication

```
POST /api/auth/register
POST /api/auth/login
```

### Videos

```
POST /api/videos/upload
GET /api/videos/:id
PUT /api/videos/:id
DELETE /api/videos/:id
```

### Comments

```
POST /api/comments
GET /api/comments/:videoId
```

---

# 📹 Video Upload Flow

```
User records video
       ↓
Video uploaded from React frontend
       ↓
Express backend receives file
       ↓
Stored in local uploads folder
       ↓
Uploaded to Google Drive
       ↓
Metadata saved in MongoDB

# 🔐 Security

* JWT authentication
* Protected routes
* Input validation
* Secure file uploads

---

# 📌 Future Improvements

* Video transcoding
* Video compression
* HLS adaptive streaming
* Video recommendations
* Likes and dislikes
* Cloud storage (AWS S3 / Cloudinary)

---

# 👨‍💻 Author

**Thrishul**

B.Tech Information Technology Student

---

# ⭐ Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

# 📜 License

This project is licensed under the **MIT License**.

