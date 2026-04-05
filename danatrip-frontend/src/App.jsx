import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';

// Layouts
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
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
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Profile from './pages/public/Profile';

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
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="booking/:tourId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
            <Route path="booking-success" element={<ProtectedRoute><BookingSuccess /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="places" element={<AdminPlaces />} />
            <Route path="places/new" element={<AdminPlaceEdit />} />
            <Route path="places/edit/:id" element={<AdminPlaceEdit />} />
            <Route path="tours" element={<AdminTours />} />
            <Route path="tours/new" element={<AdminTourEdit />} />
            <Route path="tours/edit/:id" element={<AdminTourEdit />} />
            <Route path="foods" element={<AdminFoods />} />
            <Route path="foods/new" element={<AdminFoodEdit />} />
            <Route path="foods/edit/:id" element={<AdminFoodEdit />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/new" element={<AdminUserEdit />} />
            <Route path="users/edit/:id" element={<AdminUserEdit />} />
          </Route>
        </Routes>
        <ChatWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;