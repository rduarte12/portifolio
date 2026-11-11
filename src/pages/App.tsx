import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Research from '../pages/Research';
import Projects from '../pages/Projects';
import Blog from '../pages/Blog';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Auth from '../pages/Auth';
import Admin from '../pages/Admin';
import AdminDashboard from '../pages/AdminDashboard';

export default function App() {
  return (
    <>
      <div className="site-window">
        <BrowserRouter>
          
          <Header />
            

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/research" element={<Research />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
          <Footer />
          
        </BrowserRouter>
      </div>
    </>
  );
}