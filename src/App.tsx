import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/crm/Dashboard';
import Deals from './pages/crm/Deals';
import Leads from './pages/crm/Leads';
import Settings from './pages/crm/Settings';
import Docs from './pages/crm/Docs';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/crm/dashboard" element={<Dashboard />} />
        <Route path="/crm/deals" element={<Deals />} />
        <Route path="/crm/leads" element={<Leads />} />
        <Route path="/crm/settings" element={<Settings />} />
        <Route path="/crm/docs" element={<Docs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
