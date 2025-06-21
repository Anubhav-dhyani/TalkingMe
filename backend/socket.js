const Chat = require('./models/Chat');
const User = require('./models/User');

const connectedUsers = new Map(); // userId -> socketId

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Store user ID with their socket
    socket.on('register', (userId) => {
      connectedUsers.set(userId, socket.id);
      console.log(`🧍 Registered ${userId} with socket ${socket.id}`);
    });

    // Join room between two users
    socket.on('join-room', ({ userId, otherUserId }) => {
      if (!userId || !otherUserId) return;
      const roomId = [userId, otherUserId].sort().join('_');
      socket.join(roomId);
      console.log(`📥 ${userId} joined room ${roomId}`);
    });

    // Send message
    socket.on('send-message', async ({ senderId, receiverId, content }) => {
      if (!senderId || !receiverId || !content) return;
       console.log(`📨 Message attempt: ${senderId} -> ${receiverId}: ${content}`);

      // Check if they are contacts
      const sender = await User.findById(senderId);
       if (!sender.contacts.includes(receiverId)) {
    console.log('❌ Message blocked: not in contacts');
    return;
  }

      const roomId = [senderId, receiverId].sort().join('_');

      // Save message in DB
      let chat = await Chat.findOne({
        participants: { $all: [senderId, receiverId] }
      });

      if (!chat) {
        chat = new Chat({ participants: [senderId, receiverId], messages: [] });
      }

      const newMsg = {
        sender: senderId,
        content,
        timestamp: new Date()
      };

      chat.messages.push(newMsg);
      await chat.save();

      // Emit to both users in the room
      io.to(roomId).emit('receive-message', {
        senderId,
        content,
        timestamp: newMsg.timestamp
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      for (const [userId, sid] of connectedUsers.entries()) {
        if (sid === socket.id) connectedUsers.delete(userId);
      }
      console.log(`❌ Disconnected: ${socket.id}`);
    });
  });
}

module.exports = { setupSocket };
