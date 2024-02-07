// models/message.js
const { model, Schema } = require('mongoose');

const messageSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true }); // Add timestamps for created and updated at

const Message = model('Message', messageSchema);

module.exports = Message;
