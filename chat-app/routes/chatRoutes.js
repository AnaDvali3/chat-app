// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const User = require('../models/user');

// Chat route
router.get('/', async (req, res) => {
    try {
        if (req.session.user) {
            const allUsers = await User.find({}, 'username');
            const messages = await Message.find({});

            const messagesWithUsernames = messages.map(message => ({
                username: message.userId.username,
                text: message.text
            }));

            res.render('chat', {
                username: req.session.user.username,
                userId: req.session.user._id,
                allUsers: allUsers.map(user => user.username),
                messages: messagesWithUsernames
            });
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
