import React from 'react'
import Navbar from './components/Navbar.jsx'
import HeroSection from './components/HeroSection.jsx'
import AboutSection from './components/AboutSection.jsx'
import CultureSection from './components/CultureSection.jsx'
import DestinationSection from './components/DestinationSection.jsx'
import CulinarySection from './components/CulinarySection.jsx'
import GallerySection from './components/GallerySection.jsx'
import ContactSection from './components/ContactSection.jsx'
import ChatWidget from './components/ChatWidget.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'

function App() {
  if (window.location.pathname.startsWith('/admin')) {
    return <AdminDashboard />
  }

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <CultureSection />
        <DestinationSection />
        <CulinarySection />
        <GallerySection />
        <ContactSection />
      </main>
      <ChatWidget />
    </>
  )
}

export default App
