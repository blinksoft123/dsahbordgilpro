import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Orders from './pages/Orders';
import Login from './pages/Login';

import Services from './pages/Services';
import Products from './pages/Products';
import Clients from './pages/Clients';
import Gallery from './pages/Gallery';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="orders" element={<Orders />} />
        <Route path="services" element={<Services />} />
        <Route path="products" element={<Products />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="clients" element={<Clients />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
