import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import Places from './pages/public/Place';
import PlaceDetail from './pages/public/PlaceDetail';
import Tours from './pages/public/Tour';
import TourDetail from './pages/public/TourDetail';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="places" element={<Places />} />
            <Route path="places/:id" element={<PlaceDetail />} />
            <Route path="tours" element={<Tours />} />
            <Route path="tours/:id" element={<TourDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* TODO: Thêm sau */}
            {/* <Route path="foods" element={<Foods />} /> */}
            {/* <Route path="foods/:id" element={<FoodDetail />} /> */}
            {/* <Route path="booking/:tourId" element={<ProtectedRoute><Booking /></ProtectedRoute>} /> */}
            {/* <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> */}

            {/* Admin Routes */}
            {/* <Route path="admin" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;