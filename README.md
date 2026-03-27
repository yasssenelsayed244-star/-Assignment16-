# Chat App

A comprehensive RESTful API built with **Node.js**, **Express**, **TypeScript**, **MongoDB**, **Socket.IO**, and **AWS S3**.  
This project implements modern backend architecture patterns including Repository Pattern, Mongoose Middleware, and Real-Time Communication.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Socket.IO Documentation](#socketio-documentation)
- [Design Patterns](#design-patterns)
- [Security](#security)

---

## Features

### Authentication & Authorization
- User registration with email verification (OTP)
- JWT-based authentication with refresh tokens
- Forget & change password via OTP
- Role-based access control (User, Admin)

### User Management
- Full CRUD operations
- Password hashing with bcrypt
- Block / Unblock users
- Admin-only endpoints

### Posts & Comments
- Create, read, update, delete posts
- Comments with cascade delete
- Post freezing (`isFrozen`) and user tagging (`tags`)
- Mongoose middleware hooks (pre/post save, find, update, delete)
- Instance method: `getCommentsCount()`
- Static method: `findByAuthor(authorId)`

### Likes System
- Like / Unlike posts and comments
- Prevent duplicate likes (unique index)
- Support for multiple target types (`post`, `comment`)

### Friend Requests & Social
- Send, accept, reject, delete friend requests
- Friends list & unfriend
- Prevent duplicate requests

### Messaging System
- Direct messaging between users
- Conversation history & unread count
- Chat recap & mark as read
- Message indexing for performance

### Group Chat
- Create groups, join, send messages
- Group member roles: owner, admin, member
- Group activity tracking

### Two-Factor Authentication (2FA)
- Enable / Disable 2FA with OTP
- OTP expiration (10 minutes)
- Secure OTP hashing

### File Upload
- Single & multiple file uploads to AWS S3 (max 5)
- File type validation (images, documents)
- 5MB size limit
- Organized folder structure

### Real-Time Communication (Socket.IO)
- Direct messaging & group chat with rooms
- Typing indicators
- Online / Offline status tracking
- Real-time notifications
- Multiple namespaces: `/`, `/chat`, `/notifications`, `/admin`
- Rate limiting per event

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Real-Time | Socket.IO |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Storage | AWS S3 + Multer |
| Email | Nodemailer (SMTP) |
| Dev Tools | Nodemon + ts-node + dotenv |

---

## Project Structure

```
project-root/
├── src/
│   ├── config/                      # Configuration files
│   │   ├── db.ts
│   │   ├── s3.config.ts
│   │   ├── multer.config.ts
│   │   └── socket.config.ts
│   │
│   ├── repositories/                # Repository Pattern
│   │   └── BaseRepository.ts
│   │
│   ├── services/                    # Business services
│   │   ├── s3/
│   │   └── socket/
│   │
│   ├── modules/                     # Feature modules
│   │   ├── auth/                    # Authentication module
│   │   ├── user/                    # User management
│   │   ├── post/                    # Posts module
│   │   ├── comment/                 # Comments module
│   │   ├── like/                    # Likes module
│   │   ├── friendRequest/           # Friend requests
│   │   ├── message/                 # Direct messages
│   │   ├── chat/                    # Chat & group chat
│   │   ├── twoFA/                   # Two-factor authentication
│   │   ├── upload/                  # File upload
│   │   └── socket/                  # Socket.IO routes
│   │
│   ├── socket/                      # Socket.IO handlers
│   │   ├── socket.events.ts
│   │   └── namespaces/
│   │
│   ├── middlewares/                 # Express middlewares
│   │   └── auth.middleware.ts
│   │
│   ├── utils/                       # Utility functions
│   │   ├── errorHandling.ts
│   │   ├── response.ts
│   │   ├── jwtHelpers.ts
│   │   ├── otpHelpers.ts
│   │   ├── send_email_function.ts
│   │   ├── socket.rateLimit.ts
│   │   └── emailTemplates/
│   │
│   ├── controllers/                 # Legacy controllers
│   │   ├── Login.ts
│   │   ├── changePassword.controller.ts
│   │   ├── forgetPassword.controller.ts
│   │   ├── refreshToken.controller.ts
│   │   └── Resend_Email_Otp.ts
│   │
│   ├── interfaces/                  # TypeScript interfaces
│   │   ├── IUser.ts
│   │   ├── IPost.ts
│   │   └── IComment.ts
│   │
│   ├── types/                       # TypeScript types
│   │   ├── express.d.ts
│   │   ├── HydratedDoc.ts
│   │   └── socket.types.ts
│   │
│   ├── app.ts                       # Express app setup
│   └── main.ts                      # Application entry point
│
├── examples/
│   └── socket-client-example.html
│
├── docs/
│   └── SOCKET_DOCUMENTATION.md
│
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Installation

### Prerequisites
- Node.js v18+
- MongoDB v6+
- AWS Account (S3)
- Gmail Account (email service)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/yasssenelsayed244-star/-Assignment16-.git
cd project-root

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Start MongoDB
mongod
```

---

## Configuration

Create a `.env` file in the root directory:

```env
# Server
PORT=3000

# Database
MONGO_URI=mongodb://localhost:27017/social-platform

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=abdelrahmanelsayesnoname@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM_NAME="Abdelrahman Elsayed"

# Admin
ADMIN_NAME="Abdelrahman Elsayed"
ADMIN_EMAIL=abdelrahmanelsayesnoname@gmail.com
ADMIN_PASSWORD=your-admin-password

# Frontend
FRONTEND_URL=http://localhost:3000

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=your-bucket-name
```

---

## Running the Application

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build
npm start
```

---

## API Documentation

**Base URL:** `http://localhost:3000/api`

### Authentication — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register new user |
| PATCH | `/confirm-email` | Verify email with OTP |
| PATCH | `/resend-otp` | Resend OTP |
| POST | `/login` | Login & get tokens |
| PATCH | `/forget-password` | Request password reset |
| PATCH | `/change-password` | Reset password with OTP |
| POST | `/refresh-token` | Refresh access token |

### Users — `/api/users`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Get all users | Admin |
| POST | `/block` | Block a user | ✅ |
| POST | `/unblock` | Unblock a user | ✅ |
| GET | `/blocked` | Get blocked users | ✅ |

### Posts — `/api/posts`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/` | Create post | ✅ |
| GET | `/` | Get all posts | ✅ |
| GET | `/:postId` | Get post by ID | ✅ |
| PATCH | `/:postId` | Update post | ✅ |
| DELETE | `/:postId` | Delete post | ✅ |

### Comments — `/api/comments`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/` | Add comment | ✅ |
| GET | `/:postId` | Get comments by post | ✅ |
| PATCH | `/:commentId` | Update comment | ✅ |
| DELETE | `/:commentId` | Delete comment | ✅ |

### Likes — `/api/likes`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/toggle` | Like / Unlike | ✅ |
| GET | `/count` | Get likes count | ✅ |
| GET | `/` | Get all likes | ✅ |

### Chat — `/api/chat`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/send` | Send direct message | ✅ |
| GET | `/chat/:userId` | Get conversation | ✅ |
| GET | `/conversations` | All conversations | ✅ |
| GET | `/unread-count` | Unread messages | ✅ |
| POST | `/groups` | Create group | ✅ |
| GET | `/groups` | List groups | ✅ |
| POST | `/groups/:id/join` | Join group | ✅ |
| POST | `/groups/:id/messages` | Send group message | ✅ |
| POST | `/friend-request` | Send friend request | ✅ |
| PATCH | `/friend-request/:id/accept` | Accept request | ✅ |
| PATCH | `/friend-request/:id/reject` | Reject request | ✅ |
| GET | `/friends` | Get friends list | ✅ |

### 2FA — `/api/2fa`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/enable` | Enable 2FA | ✅ |
| POST | `/confirm-enable` | Confirm with OTP | ✅ |
| POST | `/disable` | Disable 2FA | ✅ |
| POST | `/verify-login` | Verify 2FA on login | ❌ |

### Upload — `/api/upload`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/single` | Upload single file to S3 | ✅ |
| POST | `/multiple` | Upload up to 5 files | ✅ |
| DELETE | `/` | Delete file from S3 | ✅ |

---

## Socket.IO Documentation

### Connection

```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});
```

### Namespaces
- `/` — General communication
- `/chat` — Chat features
- `/notifications` — Notifications
- `/admin` — Admin only

### Client Events (Emit)

```javascript
socket.emit('sendMessage', { to: 'userId', message: 'Hello!' });
socket.emit('typing', { to: 'userId', isTyping: true });
socket.emit('joinRoom', 'room-123');
socket.emit('roomMessage', { roomId: 'room-123', message: 'Hey!' });
```

### Server Events (Listen)

```javascript
socket.on('receiveMessage', (data) => console.log(data));
socket.on('userTyping', (data) => console.log(data.from, 'is typing...'));
socket.on('notification', (data) => console.log(data));
socket.on('onlineUsers', (users) => console.log(users));
```

### Rate Limits

| Event | Limit | Window |
|---|---|---|
| sendMessage | 20 | 1 minute |
| typing | 30 | 1 minute |
| roomMessage | 10 | 1 minute |

---

## Design Patterns

- **Repository Pattern** — Separates data access from business logic
- **Service Layer Pattern** — Encapsulates business logic
- **Mongoose Middleware** — Automates pre/post hooks on save, find, delete
- **MVC Pattern** — Models, Controllers, Services separation
- **Singleton Pattern** — Single Socket.IO server instance

---

## Security

- ✅ JWT authentication (access + refresh tokens)
- ✅ Password hashing with bcrypt
- ✅ OTP hashing (SHA-256)
- ✅ Email verification required
- ✅ Role-based access control
- ✅ Rate limiting on Socket.IO events
- ✅ Input validation with Zod
- ✅ CORS configuration
- ✅ Environment variables for secrets

---

## Author

**Abdelrahman Elsayed Abdelbadie**  
GitHub: [@yasssenelsayed244-star](https://github.com/yasssenelsayed244-star)  
LinkedIn: [abdelrahman-e-b2160435b](https://www.linkedin.com/in/abdelrahman-e-b2160435b)  
Email: abdelrahmanelsayesnoname@gmail.com
