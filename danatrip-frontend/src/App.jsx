import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';

// Layouts
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminHomeRedirect from './components/common/AdminHomeRedirect';
import VisitTracker from './components/common/VisitTracker';
import ChatWidget from './components/chat/ChatWidget';

// Public Pages
import Home from './pages/public/Home';
import Places from './pages/public/Place';
import PlaceDetail from './pages/public/PlaceDetail';
import Tours from './pages/public/Tour';
import TourDetail from './pages/public/TourDetail';
import Foods from './pages/public/Food';
import FoodDetail from './pages/public/FoodDetail';
import Booking from './pages/public/Booking';
import BookingSuccess from './pages/public/BookingSuccess';
import MomoPaymentReturn from './pages/public/MomoPaymentReturn';
import VNPayPaymentReturn from './pages/public/VNPayPaymentReturn';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import Profile from './pages/public/Profile';
import Reviews from './pages/public/Reviews';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminPlaces from './pages/admin/AdminPlace';
import AdminPlaceEdit from './pages/admin/AdminPlaceEdit';
import AdminTours from './pages/admin/AdminTour';
import AdminTourEdit from './pages/admin/AdminTourEdit';
import AdminFoods from './pages/admin/AdminFood';
import AdminFoodEdit from './pages/admin/AdminFoodEdit';
import AdminBookings from './pages/admin/AdminBooking';
import AdminReviews from './pages/admin/AdminReview';
import AdminContacts from './pages/admin/AdminContact';
import AdminUsers from './pages/admin/AdminUser';
import AdminUserEdit from './pages/admin/AdminUserEdit';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <VisitTracker />
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="places" element={<Places />} />
            <Route path="places/:id" element={<PlaceDetail />} />
            <Route path="tours" element={<Tours />} />
            <Route path="tours/:id" element={<TourDetail />} />
            <Route path="foods" element={<Foods />} />
            <Route path="foods/:id" element={<FoodDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
            <Route path="booking/:tourId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
            <Route path="booking-success" element={<ProtectedRoute><BookingSuccess /></ProtectedRoute>} />
            <Route path="payment/momo-return" element={<MomoPaymentReturn />} />
            <Route path="payment/vnpay-return" element={<VNPayPaymentReturn />} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin', 'WebsiteManager', 'Partner']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminHomeRedirect />} />
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['WebsiteManager', 'Partner']}><Dashboard /></ProtectedRoute>} />
            <Route path="places" element={<ProtectedRoute allowedRoles={['WebsiteManager']}><AdminPlaces /></ProtectedRoute>} />
            <Route path="places/new" element={<ProtectedRoute allowedRoles={['WebsiteManager']}><AdminPlaceEdit /></ProtectedRoute>} />
            <Route path="places/edit/:id" element={<ProtectedRoute allowedRoles={['WebsiteManager']}><AdminPlaceEdit /></ProtectedRoute>} />
            <Route path="tours" element={<ProtectedRoute allowedRoles={['WebsiteManager', 'Partner']}><AdminTours /></ProtectedRoute>} />
            <Route path="tours/new" element={<ProtectedRoute allowedRoles={['WebsiteManager', 'Partner']}><AdminTourEdit /></ProtectedRoute>} />
            <Route path="tours/edit/:id" element={<ProtectedRoute allowedRoles={['WebsiteManager', 'Partner']}><AdminTourEdit /></ProtectedRoute>} />
            <Route path="foods" element={<ProtectedRoute allowedRoles={['WebsiteManager']}><AdminFoods /></ProtectedRoute>} />
            <Route path="foods/new" element={<ProtectedRoute allowedRoles={['WebsiteManager']}><AdminFoodEdit /></ProtectedRoute>} />
            <Route path="foods/edit/:id" element={<ProtectedRoute allowedRoles={['WebsiteManager']}><AdminFoodEdit /></ProtectedRoute>} />
            <Route path="bookings" element={<ProtectedRoute allowedRoles={['WebsiteManager']}><AdminBookings /></ProtectedRoute>} />
            <Route path="reviews" element={<ProtectedRoute allowedRoles={['WebsiteManager']}><AdminReviews /></ProtectedRoute>} />
            <Route path="contacts" element={<ProtectedRoute allowedRoles={['WebsiteManager']}><AdminContacts /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute allowedRoles={['Admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="users/new" element={<ProtectedRoute allowedRoles={['Admin']}><AdminUserEdit /></ProtectedRoute>} />
            <Route path="users/edit/:id" element={<ProtectedRoute allowedRoles={['Admin']}><AdminUserEdit /></ProtectedRoute>} />
          </Route>
        </Routes>
        <ChatWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
