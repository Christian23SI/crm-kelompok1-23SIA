import { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import MainLayout from './components/MainLayout';
import UserLayout from './components/UserLayout';
import Dashboard from './pages/Dashboard';
import CustomerManagement from './pages/CustomerManagement';
import SalesManagement from './pages/SalesManagement';
import ProductManagement from './pages/ProductManagement';
import AccountSetting from './pages/AccountSetting';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import FAQ from './pages/FAQ';
import ManajemenInventaris from './pages/ManajemenInventaris';
import ManajemenFeedback from './pages/ManajemenFeedback';
import EmailNotification from './pages/EmailNotification';
import User from './pages/ListUser';
import UserDashboard from './pages/UserDashboard';
import MenuUser from './pages/MenuUser';
import LoyaltyManagement from './pages/LoyaltyManagement';
import FaqUser from './pages/FAQUser';
import CustomerFeedbackPage from './pages/CustomerFeedbackPage';
import Loading from './components/Loading';
import AccountSettingUser from './pages/AccountSettingUser';
import OrderHistory from './pages/OrderHistory';
import LoyaltyPredictionPage from './pages/LoyaltyPredictionPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        const session = JSON.parse(localStorage.getItem('auth'));
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('signup')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (data && !error) {
            setUser(data);
          } else {
            localStorage.removeItem('auth');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [location]);

  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/signin" element={!user ? <SignIn /> : <Navigate to={user.role === 'admin' ? '/' : '/dashboarduser'} />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to={user.role === 'admin' ? '/' : '/dashboarduser'} />} />
      
      {/* Admin Routes */}
      <Route 
        element={user?.role === 'admin' ? <MainLayout /> : <Navigate to="/signin" state={{ from: location }} replace />}
      >
        <Route path='/' element={<Dashboard />} />
        <Route path='/customermanagement' element={<CustomerManagement />} />
        <Route path='/penjualan' element={<SalesManagement />} />
        <Route path='/produk' element={<ProductManagement />} />
        <Route path='/faq' element={<FAQ />} />
        <Route path='/inventaris' element={<ManajemenInventaris />} />
        <Route path='/feedback' element={<ManajemenFeedback />} />
        <Route path='/email' element={<EmailNotification />} />
        <Route path='/akun' element={<AccountSetting />} />
        <Route path='/predict' element={<LoyaltyPredictionPage />} />
        <Route path='/user' element={<User />} />
      </Route>
      
      {/* User Routes */}
      <Route 
        element={user?.role === 'user' ? <UserLayout /> : <Navigate to="/signin" state={{ from: location }} replace />}
      >
        <Route path='/dashboarduser' element={<UserDashboard />} />
        <Route path='/produkuser' element={<MenuUser />} />
        <Route path='/pemesananuser' element={<OrderHistory />} />
        <Route path='/loyaltymanagement' element={<LoyaltyManagement />} />
        <Route path='/faquser' element={<FaqUser />} />
        <Route path='/akunuser' element={<AccountSettingUser />} />
        <Route path='/feedbackuser' element={<CustomerFeedbackPage />} />
      </Route>
      
      {/* Catch-all Route */}
      <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/' : '/dashboarduser') : '/signin'} />} />
    </Routes>
  );
}

export default App;