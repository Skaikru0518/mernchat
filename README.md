# MERNChat

MERNChat is a full-stack real-time chat application built using the MERN (MongoDB, Express.js, React.js, Node.js) stack. It enables users to engage in seamless one-on-one and group conversations with features like real-time messaging, user authentication, and more.

## 🚀 Features

- **User Authentication**: Secure login and registration system.
- **Real-Time Messaging**: Instant messaging powered by WebSockets.
- **Group Chats**: Create and manage group conversations.
- **Typing Indicators**: Visual indicators when a user is typing.
- **Media Sharing**: Share images and files within the chat.
- **Notifications**: Real-time notifications for new messages.

## 🛠 Tech Stack

- **Frontend**: React.js, Context API, WebSocket API
- **Backend**: Node.js, Express.js, WebSocket
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)

## Staring the project:

1. Create a .env in /api

   ```text
   PORT = 4000
   MONGO_URL: 'your_mongo_db_connection_url' // 'mongodb+srv://<username:password>.....
   JWT_SECRET: 'YOUR_JWT_SECRET'
   CLIENT_URL: 'hhtp://localhost:5173' // vite frontend url

   ```

2. Start backend

   - navigate to /api/ and run
   - by default it will run on localhost:PORT (from .env)

   ```bash
   node index.js

   ```

3. Start frontend
   - navigate to /client/ and run
   - by default it will run on localhost:5173
   ```bash
   npm run dev
   ```

## 💬 Usage

- Register an account: Sign up with a unique username and password.
- Log in: Access your account using your credentials.
- Start chatting:
- Search for users to start a one-on-one chat.
- Create a new group chat and add participants.
- Send text messages, share files, and images.
- View typing indicators and receive real-time notifications.

## 🔗 Real-Time Communication (WebSockets)

MERNChat uses the WebSocket API instead of Socket.IO for real-time communication. The WebSocket connection allows bi-directional messaging between the client and the server.

1. Frontend: Uses the WebSocket constructor to establish a persistent connection with the backend.

2. Backend: Uses the native ws WebSocket library to handle incoming connections and messages.

## 📁 Folder Structure

    ```text
      mernchat/
      ├── api/                # Backend (Node.js, Express.js, WebSocket)
      │   ├── controllers/    # Request handlers
      │   ├── models/         # Mongoose schemas
      │   ├── routes/         # API routes
      │   ├── sockets/        # WebSocket event handlers
      │   └── app.js          # Express app setup
      ├── client/             # Frontend (React.js)
      │   ├── public/         # Static files
      │   └── src/
      │       ├── components/ # React components
      │       ├── context/    # Context API for state management
      │       ├── pages/      # React pages
      │       ├── services/   # API calls
      │       └── App.js      # Main React component
      └── README.md           # Project documentation

## 📜 License

This project is licensed under the MIT License. See the LICENSE file for details.
