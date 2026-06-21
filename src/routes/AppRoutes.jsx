import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Dashboard from '../pages/Dashboard';
import Education from '../pages/Education';
import ArticleDetail from '../pages/ArticleDetail';
import SelfExam from '../pages/SelfExam';
import Records from '../pages/Records';
import Reminders from '../pages/Reminders';
import Directory from '../pages/Directory';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';

// Admin Pages
import AdminDashboard from '../pages/Admin/AdminDashboard';
import ManageEducation from '../pages/Admin/ManageEducation';
import ManageFacilities from '../pages/Admin/ManageFacilities';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Primary Layout Container wrapper */}
      <Route path="/" element={<Layout />}>
        {/* Landing Page */}
        <Route index element={<Landing />} />
        
        {/* Authentication */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        {/* Dashboard & User Module Modules */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="education" element={<Education />} />
        <Route path="education/article" element={<ArticleDetail />} />
        <Route path="self-examination" element={<SelfExam />} />
        <Route path="records" element={<Records />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="clinics" element={<Directory />} />
        <Route path="profile" element={<Profile />} />
        
        {/* Administrative Modules */}
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/education" element={<ManageEducation />} />
        <Route path="admin/facilities" element={<ManageFacilities />} />
        
        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
