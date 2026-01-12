import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

const ChatWindow = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      socket.emit('joinConversation', conversationId);
      
      socket.on('newMessage', handleNewMessage);
      socket.on('userTyping', handleUserTyping);
    }

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleUserTyping);
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/messages/${conversationId}`);
      setMessages(response.data.messages);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleNewMessage = (data) => {
    setMessages(prev => [...prev, data.message]);
    scrollToBottom();
  };

  const handleUserTyping = (data) => {
    // Handle typing indicators
    setTypingUsers(prev => [...prev, data.userId]);
    setTimeout(() => {
      setTypingUsers(prev => prev.filter(id => id !== data.userId));
    }, 2000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(`/api/messages/${conversationId}`, {
        content: newMessage
      });

      socket.emit('sendMessage', {
        conversationId,
        message: response.data.message
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={message._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex ${message.sender._id === 'current-user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                message.sender._id === 'current-user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-75">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              socket.emit('typing', { conversationId, userId: 'current-user' });
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            Send
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;