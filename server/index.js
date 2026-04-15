const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const http = require('http');
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // Adjust as necessary for production
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edusync', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const studentRoutes = require('./routes/student');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/superadmin', require('./routes/superadmin'));
app.use('/api/institution', require('./routes/institution'));
app.use('/api/chat', require('./routes/chatRoutes'));

app.get('/', (req, res) => {
    res.send('EduSync API is running');
});

// Socket.io connection logic
io.on("connection", (socket) => {
    console.log("User connected to chat:", socket.id);

    // User joins their personal room securely with their User ID
    socket.on("setup", (userId) => {
        socket.join(userId);
        socket.emit("connected");
    });

    socket.on("new_message", (newMessage) => {
        // Assume newMessage contains receiverId or sender/text structured in a way frontend can read
        const receiverId = newMessage.receiverId;

        // Emit to the receiver's personal room
        if (receiverId) {
            socket.in(receiverId).emit("message_received", newMessage);
        }
    });

    socket.on("delete_message", (data) => {
        const { messageId, receiverId } = data;
        if (receiverId) {
            socket.in(receiverId).emit("message_deleted", { messageId });
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected from chat");
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (accessible to other laptops on your network)`);
});
