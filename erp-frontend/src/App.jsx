import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Recruitment from './pages/Recruitment';
import Complaints from './pages/Complaints';
import Procurement from './pages/Procurement';
import ITSupport from './pages/ITSupport';
import VendorMgmt from './pages/VendorMgmt';
import Training from './pages/Training';
import Performance from './pages/Performance';
import CRM from './pages/CRM';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><Layout><Inventory /></Layout></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Layout><Orders /></Layout></PrivateRoute>} />
          <Route path="/recruitment" element={<PrivateRoute><Layout><Recruitment /></Layout></PrivateRoute>} />
          <Route path="/complaints" element={<PrivateRoute><Layout><Complaints /></Layout></PrivateRoute>} />
          <Route path="/procurement" element={<PrivateRoute><Layout><Procurement /></Layout></PrivateRoute>} />
          <Route path="/it-support" element={<PrivateRoute><Layout><ITSupport /></Layout></PrivateRoute>} />
          <Route path="/vendors" element={<PrivateRoute><Layout><VendorMgmt /></Layout></PrivateRoute>} />
          <Route path="/training" element={<PrivateRoute><Layout><Training /></Layout></PrivateRoute>} />
          <Route path="/performance" element={<PrivateRoute><Layout><Performance /></Layout></PrivateRoute>} />
          <Route path="/crm" element={<PrivateRoute><Layout><CRM /></Layout></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
