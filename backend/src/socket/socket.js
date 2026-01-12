const socketIO = require('socket.io');

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join user room
    socket.on('joinUser', (userId) => {
      socket.join(`user_${userId}`);
    });

    // Join conversation room
    socket.on('joinConversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    // Send message
    socket.on('sendMessage', async (data) => {
      const { conversationId, message } = data;
      
      // Broadcast to conversation room
      io.to(`conversation_${conversationId}`).emit('newMessage', {
        conversationId,
        message
      });

      // Notify participants
      // ... implementation
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(`conversation_${data.conversationId}`).emit('userTyping', {
        userId: data.userId,
        conversationId: data.conversationId
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };