import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import Account from './pages/AccountPage';
import Home from './pages/Home';
import Blindspot from './pages/Blindspot';
import Foryou from './pages/Foryou'
import Local from './pages/Local';
import { Routes, Route, useLocation } from 'react-router-dom'; // useLocation add kiya
import BlindspotPage from './pages/Blindspot';
import About from "./pages/About";
import Mission from "./pages/Mission";
import Blog from "./pages/Blog";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import CookiePolicy from "./pages/CookiePolicy";
import HelpCenter from "./pages/HelpCenter";
import FAQ from "./pages/FAQ";
import Sources from "./pages/Sources";
import ClusterDetail from "./pages/ClusterDetail";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";


function App() {
  const location = useLocation(); // ye batayega konsa URL hai

  // login ya register par navbar/footer hide
  const hideHeader = location.pathname.toLowerCase() === '/login' ||
    location.pathname.toLowerCase() === '/register';

  return (
    <>
      {!hideHeader && <Navbar />}   {/* agar login nahi to dikhao */}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<Account />} />
        <Route path="/" element={<Home />} />
        <Route path='blindspot' element={<Blindspot />} />
        <Route path='local' element={<Local />} />
        <Route path="/about" element={<About />} />
        <Route path="/mission" element={<Mission />} />
        <Route path="/blog" element={<Blog />} />

        <Route path="/help" element={<HelpCenter />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/cluster/:slug" element={<ClusterDetail />} />
        <Route path="/foryou" element={<Foryou/>}/>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />

      </Routes>

      <Footer /> {/* footer bhi hide */}
    </>
  )
}

export default App;
