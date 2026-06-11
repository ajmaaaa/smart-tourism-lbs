import React, { useEffect, useState } from 'react'

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  const openChat = () => {
    window.dispatchEvent(new CustomEvent('open-chat'))
    setOpen(false)
  }

  const menus = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'tentang', label: 'Tentang' },
    { id: 'panduan', label: 'Panduan' },
    { id: 'budaya', label: 'Budaya' },
    { id: 'destinasi', label: 'Wisata' },
    { id: 'kuliner', label: 'Kuliner' },
    { id: 'galeri', label: 'Galeri' }
  ]

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <button className="navbar__brand" type="button" onClick={() => scrollTo('beranda')} aria-label="Kembali ke beranda">
          <img src="/penyengat-mark.svg" alt="" />
          <span className="navbar__brand-text">
            <small>Wisata Melayu</small>
            <strong>Explore Penyengat</strong>
          </span>
        </button>

        <button
          className="navbar__toggle"
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="main-navigation"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="main-navigation" className={`navbar__links ${open ? 'is-open' : ''}`} aria-label="Menu utama">
          {menus.map((item) => (
            <button key={item.id} type="button" onClick={() => scrollTo(item.id)}>{item.label}</button>
          ))}
          <button className="navbar__assistant" type="button" onClick={openChat}>Tanya Pak Cik</button>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
