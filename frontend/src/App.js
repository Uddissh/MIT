import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Messages from './pages/Messages';
import AIBot from './pages/AIBot';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/feed" />} />
              <Route path="feed" element={<Feed />} />
              <Route path="messages" element={<Messages />} />
              <Route path="messages/:conversationId" element={<Messages />} />
              <Route path="ai-bot" element={<AIBot />} />
              <Route path="profile/:userId" element={<Profile />} />
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;