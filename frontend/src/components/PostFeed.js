import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import PostCard from './PostCard';
import CreatePost from './CreatePost';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/posts');
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`/api/posts/${postId}/like`);
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, likes: [...post.likes, { _id: 'current-user' }] }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <CreatePost onNewPost={handleNewPost} />
      
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <PostCard post={post} onLike={handleLike} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PostFeed;