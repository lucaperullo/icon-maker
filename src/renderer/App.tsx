// src/renderer/App.tsx (Updated)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MyIcons from './pages/MyIcons';
import Settings from './pages/Settings';
import { ThemeProvider } from './context/ThemeContext';
import { UpdateProvider } from './context/UpdateContext';
import UpdateNotification from './components/UpdateNotification';
import './App.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <UpdateProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/my-icons" element={<MyIcons />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
          <UpdateNotification />
        </Router>
      </UpdateProvider>
    </ThemeProvider>
  );
};

export default App;