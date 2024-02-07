const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/user'); 
const Message = require('./models/message'); 
const session = require('express-session');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const crypto = require('crypto');
// MongoDB connection setup
mongoose.connect('mongodb://localhost:27017/chatApp').then(() => {
    console.log('Connected to DB');
});

const secret = crypto.randomBytes(32).toString('hex');


// Express setup
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(session({ secret: secret, resave: true, saveUninitialized: true }));

// Routes setup
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/user', userRoutes);
app.use('/chat', chatRoutes); // No need for isAuthenticated middleware


app.get('/', (req, res) => {
    res.redirect('/user/login');
});

// Socket.IO setup
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Add user to connectedUsers object
    socket.on('chat message', async (msg) => {
        console.log('message: ' + msg);
    
        // Save message to database with correct user_id
        try {
            const newMessage = await Message.create({ text: msg, userId: socket.user_id });
            console.log('Message saved to DB:', newMessage);
        } catch (error) {
            console.error('Error saving message to DB:', error);
        }
    
        // Broadcast the message to all connected clients with username
        io.emit('chat message', { username: socket.username, text: msg });
    });    

    socket.on('sendMessage', async (data) => {
        try {
            // Save the message to the database
            const message = new Message({
                text: data.text,
                userId: data.userId
            });
            await message.save();

            // Retrieve the associated username from the User model
            const user = await User.findById(data.userId);
            const username = user.username;

            // Broadcast the new message to all connected clients
            io.emit('newMessage', { username, text: message.text });
        } catch (error) {
            console.error(error);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
