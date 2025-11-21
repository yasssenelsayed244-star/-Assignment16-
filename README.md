# Chat App

A comprehensive RESTful API built with Node.js, Express, TypeScript, MongoDB, Socket.IO, and AWS S3. This project implements modern backend architecture patterns including Repository Pattern, Mongoose Middleware, and Real-Time Communication.

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
- [Testing](#testing)
- [Design Patterns](#design-patterns)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Authentication & Authorization
- User registration with email verification (OTP)
- Email verification system
- Resend OTP functionality
- JWT-based authentication
- Forget password with OTP
- Change password functionality
- Refresh token mechanism
- Role-based access control (User, Admin)

### User Management
- User CRUD operations
- Password hashing with bcrypt
- Protected routes with middleware
- Admin-only endpoints
- Block/Unblock users
- Get blocked users list

### Posts & Comments
- Create, read, update, delete posts
- Add comments to posts
- Populate author information
- Cascade delete (deleting post removes comments)
- Real-time notifications
- Post freezing functionality (isFrozen field)
- User tagging in posts (tags field)
- Mongoose middleware hooks (pre/post save, find, update, delete)
- Instance methods (getCommentsCount)
- Static methods (findByAuthor)

### Likes System
- Like/Unlike posts and comments
- Get likes count for posts and comments
- Get all likes for a specific target
- Prevent duplicate likes (unique index)
- Support for multiple target types (post, comment)

### Friend Requests & Social
- Send friend requests
- Accept/Reject friend requests
- Get pending friend requests
- Get friends list
- Unfriend users
- Delete friend requests
- Prevent duplicate friend requests

### Messaging System
- Direct messaging between users
- Get conversation history
- Get all conversations
- Unread message count
- Chat recap
- Mark messages as read
- Message indexing for performance

### Group Chat
- Create chat groups
- Join groups
- Send group messages
- Get group chat history
- List user groups
- Group member roles (owner, admin, member)
- Group activity tracking

### Two-Factor Authentication (2FA)
- Enable 2FA with OTP verification
- Disable 2FA with password confirmation
- 2FA login verification
- OTP expiration (10 minutes)
- Secure OTP hashing

### File Upload
- Single file upload to AWS S3
- Multiple files upload (max 5)
- File type validation (images, documents)
- File size limit (5MB)
- Delete files from S3
- Organized folder structure

### Real-Time Communication
- Socket.IO integration
- Direct messaging between users
- Group chat with rooms
- Typing indicators
- Online/Offline status tracking
- Real-time notifications
- Multiple namespaces (/, /chat, /notifications, /admin)
- Rate limiting per event

### Advanced Features
- Repository Pattern implementation
- Mongoose Hooks & Middleware
- Email templates with Nodemailer
- Error handling middleware
- Response standardization
- TypeScript support
- Rate limiting for Socket.IO events

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB
- **ODM:** Mongoose
- **Real-Time:** Socket.IO

### Authentication & Security
- **JWT:** jsonwebtoken
- **Hashing:** bcrypt
- **Validation:** Zod

### Cloud Services
- **Storage:** AWS S3
- **Email:** Nodemailer (SMTP)

### File Handling
- **Upload:** Multer

### Development Tools
- **Compiler:** TypeScript
- **Dev Server:** Nodemon + ts-node
- **Environment:** dotenv

---

## Project Structure

```
project-root/
├── src/
│   ├── config/              # Configuration files
│   │   ├── db.ts
│   │   ├── s3.config.ts
│   │   ├── multer.config.ts
│   │   └── socket.config.ts
│   │
│   ├── repositories/        # Repository Pattern
│   │   └── BaseRepository.ts
│   │
│   ├── services/            # Business services
│   │   ├── s3/
│   │   └── socket/
│   │
│   ├── modules/             # Feature modules
│   │   ├── auth/            # Authentication module
│   │   ├── user/            # User management
│   │   ├── post/            # Posts module
│   │   ├── comment/        # Comments module
│   │   ├── like/           # Likes module
│   │   ├── friendRequest/  # Friend requests
│   │   ├── message/        # Direct messages
│   │   ├── chat/           # Chat & group chat
│   │   ├── twoFA/          # Two-factor authentication
│   │   ├── upload/         # File upload
│   │   └── socket/         # Socket.IO routes
│   │
│   ├── socket/              # Socket.IO handlers
│   │   ├── socket.events.ts
│   │   └── namespaces/
│   │
│   ├── middlewares/         # Express middlewares
│   │   └── auth.middleware.ts
│   │
│   ├── utils/               # Utility functions
│   │   ├── errorHandling.ts
│   │   ├── response.ts
│   │   ├── jwtHelpers.ts
│   │   ├── otpHelpers.ts
│   │   ├── send_email_function.ts
│   │   ├── socket.rateLimit.ts
│   │   └── emailTemplates/
│   │
│   ├── controllers/        # Legacy controllers
│   │   ├── Login.ts
│   │   ├── changePassword.controller.ts
│   │   ├── forgetPassword.controller.ts
│   │   ├── refreshToken.controller.ts
│   │   └── Resend_Email_Otp.ts
│   │
│   ├── interfaces/          # TypeScript interfaces
│   │   ├── IUser.ts
│   │   ├── IPost.ts
│   │   └── IComment.ts
│   │
│   ├── config/             # Configuration files
│   │   ├── bootstrap.ts
│   │   ├── db.ts
│   │   ├── multer.config.ts
│   │   ├── s3.config.ts
│   │   └── socket.config.ts
│   │
│   ├── types/               # TypeScript types
│   │   ├── express.d.ts
│   │   ├── HydratedDoc.ts
│   │   └── socket.types.ts
│   │
│   ├── app.ts              # Express app setup
│   └── main.ts             # Application entry point
│
├── examples/               # Example files
│   └── socket-client-example.html
│
├── docs/                   # Documentation
│   └── SOCKET_DOCUMENTATION.md
│
├── .env                    # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- AWS Account (for S3)
- Gmail Account (for sending emails)

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd project-root
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```bash
cp .env.example .env
```

4. **Configure environment variables** (see [Configuration](#configuration))

5. **Start MongoDB**
```bash
mongod
# or if using MongoDB Atlas, ensure your connection string is correct
```

---

## Configuration

Create a `.env` file in the root directory:

```env
# ========== Server ==========
PORT=3000

# ========== Database ==========
MONGO_URI=mongodb://localhost:27017/social-platform

# ========== JWT ==========
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRE=7d

# ========== Email Configuration ==========
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=abdelrahmanelsayesnoname@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM_NAME="Abdelrahman elsayed"

# ========== Default Admin ==========
ADMIN_NAME="Abdelrahman elsayed"
ADMIN_EMAIL=abdelrahmanelsayesnoname@gmail.com
ADMIN_PASSWORD=super-secure-password-change-me

# ========== Frontend ==========
FRONTEND_URL=http://localhost:3000

# ========== AWS S3 Configuration ==========
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_BUCKET_NAME=your-bucket-name
```

### Gmail Setup
1. Enable 2-Factor Authentication
2. Generate App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Use the generated password in `EMAIL_PASSWORD`

### AWS S3 Setup
1. Create an S3 bucket
2. Create IAM user with S3 permissions
3. Generate access keys
4. Update `.env` with credentials

---

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build

---

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Routes (`/api/auth`)

#### 1. Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Ahmed Mohamed",
  "email": "ahmed@example.com",
  "password": "password123"
}
```

#### 2. Verify Email
```http
PATCH /api/auth/confirm-email
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "otp": "123456"
}
```

#### 3. Resend OTP
```http
PATCH /api/auth/resend-otp
Content-Type: application/json

{
  "email": "ahmed@example.com"
}
```

#### 4. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "password123"
}

Response:
{
  "status": "success",
  "message": "Logged in successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 5. Forget Password
```http
PATCH /api/auth/forget-password
Content-Type: application/json

{
  "email": "ahmed@example.com"
}
```

#### 6. Change Password
```http
PATCH /api/auth/change-password
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

#### 7. Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "token": "current-jwt-token"
}
```

### User Routes (`/api/users`)

#### Get All Users (Admin Only)
```http
GET /api/users
Authorization: Bearer <admin-token>
```

#### Block User
```http
POST /api/users/block
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-id-to-block"
}
```

#### Unblock User
```http
POST /api/users/unblock
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-id-to-unblock"
}
```

#### Get Blocked Users
```http
GET /api/users/blocked
Authorization: Bearer <token>
```

### Post Routes (`/api/posts`)

#### Create Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "author": "user-id",
  "content": "This is my first post!",
  "isFrozen": false,
  "tags": ["user-id-1", "user-id-2"]
}
```

**Fields:**
- `author` (required) - User ID of the post author
- `content` (required) - Post content text
- `isFrozen` (optional) - Boolean to freeze/unfreeze the post (default: false)
- `tags` (optional) - Array of user IDs to tag in the post

#### Get All Posts
```http
GET /api/posts
Authorization: Bearer <token>
```

#### Get Post by ID
```http
GET /api/posts/:postId
Authorization: Bearer <token>
```

#### Update Post
```http
PATCH /api/posts/:postId
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated post content",
  "isFrozen": false,
  "tags": ["user-id-1"]
}
```

#### Delete Post
```http
DELETE /api/posts/:postId
Authorization: Bearer <token>
```

### Comment Routes (`/api/comments`)

#### Add Comment
```http
POST /api/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "postId": "post-id",
  "author": "user-id",
  "content": "Great post!"
}
```

#### Get Comments by Post
```http
GET /api/comments/:postId
Authorization: Bearer <token>
```

#### Update Comment
```http
PATCH /api/comments/:commentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated comment"
}
```

#### Delete Comment
```http
DELETE /api/comments/:commentId
Authorization: Bearer <token>
```

### Upload Routes (`/api/upload`)

#### Upload Single File
```http
POST /api/upload/single?folder=profiles/
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: [binary]
```

#### Upload Multiple Files
```http
POST /api/upload/multiple?folder=posts/
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [binary array]
```

#### Delete File
```http
DELETE /api/upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "key": "file-key-from-s3"
}
```

### Socket Routes (`/api/socket`)

#### Get Online Users
```http
GET /api/socket/online-users
Authorization: Bearer <token>
```

#### Check User Status
```http
GET /api/socket/user-status/:userId
Authorization: Bearer <token>
```

#### Send Notification
```http
POST /api/socket/send-notification
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "recipient-id",
  "type": "info",
  "title": "New Notification",
  "message": "You have a new follower"
}
```

#### Broadcast Notification (Admin)
```http
POST /api/socket/broadcast-notification
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "type": "system",
  "title": "Maintenance",
  "message": "System will be down for 10 minutes"
}
```

### Two-Factor Authentication Routes (`/api/2fa`)

#### Enable 2FA
```http
POST /api/2fa/enable
Authorization: Bearer <token>
```

#### Confirm Enable 2FA
```http
POST /api/2fa/confirm-enable
Authorization: Bearer <token>
Content-Type: application/json

{
  "otp": "123456"
}
```

#### Disable 2FA
```http
POST /api/2fa/disable
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "user-password"
}
```

#### Verify 2FA Login
```http
POST /api/2fa/verify-login
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Chat Routes (`/api/chat`)

#### Send Direct Message
```http
POST /api/chat/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiver": "user-id",
  "content": "Hello!"
}
```

#### Get Chat with User
```http
GET /api/chat/chat/:otherUserId
Authorization: Bearer <token>
```

#### Get All Conversations
```http
GET /api/chat/conversations
Authorization: Bearer <token>
```

#### Get Unread Count
```http
GET /api/chat/unread-count
Authorization: Bearer <token>
```

#### Get Chat Recap
```http
GET /api/chat/recap
Authorization: Bearer <token>
```

### Group Chat Routes (`/api/chat`)

#### Create Chat Group
```http
POST /api/chat/groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Group",
  "description": "Group description"
}
```

#### List User Groups
```http
GET /api/chat/groups
Authorization: Bearer <token>
```

#### Get Group Chat
```http
GET /api/chat/groups/:groupId/messages
Authorization: Bearer <token>
```

#### Join Group
```http
POST /api/chat/groups/:groupId/join
Authorization: Bearer <token>
```

#### Send Group Message
```http
POST /api/chat/groups/:groupId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello group!"
}
```

### Friend Request Routes (`/api/chat`)

#### Send Friend Request
```http
POST /api/chat/friend-request
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiver": "user-id"
}
```

#### Get Friend Requests
```http
GET /api/chat/friend-requests
Authorization: Bearer <token>
```

#### Accept Friend Request
```http
PATCH /api/chat/friend-request/:requestId/accept
Authorization: Bearer <token>
```

#### Reject Friend Request
```http
PATCH /api/chat/friend-request/:requestId/reject
Authorization: Bearer <token>
```

#### Delete Friend Request
```http
DELETE /api/chat/friend-request/:requestId
Authorization: Bearer <token>
```

#### Get Friends List
```http
GET /api/chat/friends
Authorization: Bearer <token>
```

#### Unfriend User
```http
POST /api/chat/unfriend
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-id"
}
```

### Like Routes (`/api/likes`)

#### Toggle Like
```http
POST /api/likes/toggle
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetType": "post",
  "targetId": "post-id"
}
```

**Target Types:**
- `"post"` - Like a post
- `"comment"` - Like a comment

#### Get Likes Count
```http
GET /api/likes/count?targetType=post&targetId=post-id
Authorization: Bearer <token>
```

#### Get All Likes
```http
GET /api/likes?targetType=post&targetId=post-id
Authorization: Bearer <token>
```

---

## Socket.IO Documentation

### Connection

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Namespaces

- `/` - Main namespace (general communication)
- `/chat` - Chat-specific features
- `/notifications` - Notification-specific features
- `/admin` - Admin-only features

### Client Events (Emit)

```javascript
// Send direct message
socket.emit('sendMessage', {
  to: 'userId',
  message: 'Hello!'
}, (response) => {
  console.log(response);
});

// Typing indicator
socket.emit('typing', {
  to: 'userId',
  isTyping: true
});

// Join room
socket.emit('joinRoom', 'room-123', (response) => {
  console.log(response);
});

// Send room message
socket.emit('roomMessage', {
  roomId: 'room-123',
  message: 'Hello everyone!'
});
```

### Server Events (Listen)

```javascript
// Connection established
socket.on('connected', (data) => {
  console.log('Connected:', data);
});

// Receive message
socket.on('receiveMessage', (data) => {
  console.log('New message:', data);
});

// User typing
socket.on('userTyping', (data) => {
  console.log(data.from, 'is typing...');
});

// Notification
socket.on('notification', (data) => {
  console.log('Notification:', data);
});

// Online users
socket.on('onlineUsers', (users) => {
  console.log('Online:', users);
});
```

### Rate Limits

| Event | Limit | Window |
|-------|-------|--------|
| sendMessage | 20 | 1 minute |
| typing | 30 | 1 minute |
| roomMessage | 10 | 1 minute |

For complete Socket.IO documentation, see [SOCKET_DOCUMENTATION.md](docs/SOCKET_DOCUMENTATION.md)

---

## Testing

### Using Postman/Thunder Client

1. Import the API collection
2. Set up environment variables
3. Test authentication flow
4. Test protected routes with token

### Using Socket.IO Client

Open `examples/socket-client-example.html` in your browser to test real-time features.

### Testing Flow

1. **Register** → Receive OTP via email
2. **Verify Email** → Confirm with OTP
3. **Login** → Get JWT token
4. **Create Post** → Post appears in real-time
5. **Add Comment** → Author receives notification
6. **Connect Socket** → Test real-time messaging

---

## Design Patterns

### 1. Repository Pattern
Separates data access logic from business logic.
```typescript
// BaseRepository provides common CRUD operations
class UserRepository extends BaseRepository<IUserDoc> {
  async findByEmail(email: string) {
    return await this.model.findOne({ email });
  }
}
```

### 2. Service Layer Pattern
Encapsulates business logic.
```typescript
export const createUser = async (dto: CreateUserDTO) => {
  // Business logic here
  const user = await userRepository.create(dto);
  await sendVerificationEmail(user);
  return user;
};
```

### 3. Mongoose Middleware Pattern
Automates common operations.
```typescript
UserSchema.pre('save', function(next) {
  console.log('About to save user');
  next();
});
```

#### Post Model Middleware
The Post model implements comprehensive middleware hooks:
- **Document Middleware:**
  - `pre('save')` - Before saving a post
  - `post('save')` - After saving a post
- **Query Middleware:**
  - `pre('find')` - Before finding posts (auto-populates author)
  - `post('find')` - After finding posts
  - `pre('findOne')` - Before finding one post
  - `pre('findOneAndUpdate')` - Before updating a post
  - `post('findOneAndUpdate')` - After updating a post
  - `pre('deleteOne')` - Before deleting a post
  - `post('deleteOne')` - After deleting a post (cascade delete comments)

#### Post Model Methods
- **Instance Methods:**
  - `getCommentsCount()` - Get the number of comments on a post
- **Static Methods:**
  - `findByAuthor(authorId)` - Find all posts by a specific author

### 4. MVC Pattern
Separation of concerns: Models, Views (API responses), Controllers.

### 5. Singleton Pattern
Single instance of Socket.IO server.

---

## Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ OTP token hashing (SHA-256)
- ✅ Email verification required
- ✅ Role-based access control
- ✅ Rate limiting (Socket.IO)
- ✅ Input validation (Zod)
- ✅ CORS configuration
- ✅ Environment variables

---

## Performance Optimizations

- Mongoose lean queries
- Populate only required fields
- Connection pooling
- Socket.IO namespaces
- Rate limiting
- Efficient indexing

---

## Error Handling

All errors are handled centrally:

```typescript
// Standardized error responses
{
  "status": "error",
  "message": "Error description"
}

// Success responses
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## Acknowledgments

- Express.js documentation
- Mongoose documentation
- Socket.IO documentation
- AWS S3 SDK documentation
- TypeScript documentation

---

## Support

For support, email your.email@example.com or open an issue on GitHub.

---

## Roadmap

- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Implement Redis caching
- [ ] Add API rate limiting
- [ ] Implement GraphQL
- [ ] Add Docker support
- [ ] CI/CD pipeline
- [ ] API versioning
- [ ] Swagger documentation
- [ ] Admin dashboard

---

## Project Stats

- **Lines of Code:** ~8000+
- **Modules:** 11 (auth, user, post, comment, like, friendRequest, message, chat, twoFA, upload, socket)
- **API Endpoints:** 50+
- **Socket Events:** 10+
- **Mongoose Hooks:** 30+
- **Post Model Hooks:** 8 hooks (pre/post save, find, update, delete)
- **Post Model Methods:** 2 methods (instance + static)
- **Database Models:** 10+ (User, Post, Comment, Like, FriendRequest, Message, GroupMessage, ChatGroup)
- **TypeScript:** 100%
- **Features:** Authentication, Posts, Comments, Likes, Friend Requests, Messaging, Group Chat, 2FA, File Upload, Real-time Communication

---

Made with Node.js, TypeScript, and Socket.IO
#   - A s s i g n m e n t 1 6 -  
 