import React, { useEffect, useState } from 'react'
import { fetchContent, getImageUrl } from '../services/contentService.js'

const fallbackGalleryItems = [
  { id: 'galeri-masjid', title: 'Masjid Sultan Riau', image: '/images/gallery-masjid.svg', className: 'tall' },
  { id: 'galeri-dermaga', title: 'Dermaga Pompong', image: '/images/gallery-dermaga.svg' },
  { id: 'galeri-laut', title: 'Tepi Laut Penyengat', image: '/images/gallery-laut.svg', className: 'wide' },
  { id: 'galeri-benteng', title: 'Benteng Bukit Kursi', image: '/images/gallery-benteng.svg' },
  { id: 'galeri-senja', title: 'Senja Penyengat', image: '/images/gallery-sunset.svg' },
  { id: 'galeri-kuliner', title: 'Kuliner Melayu', image: '/images/gallery-kuliner.svg' },
  { id: 'galeri-budaya', title: 'Budaya Melayu', image: '/images/gallery-budaya.svg', className: 'wide' },
  { id: 'galeri-makam', title: 'Makam Bersejarah', image: '/images/gallery-makam.svg' },
  { id: 'galeri-adat', title: 'Rumah Adat', image: '/images/gallery-adat.svg' }
]

function GallerySection() {
  const [galleryItems, setGalleryItems] = useState(fallbackGalleryItems)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetchContent('/api/gallery', fallbackGalleryItems).then((items) => {
      if (items.length) setGalleryItems(items)
    })
  }, [])

  return (
    <section id="galeri" className="section gallery-section">
      <SectionHeader badge="Galeri" title="Galeri Foto" desc="Keindahan Pulau Penyengat dari berbagai sudut pandang." />

      <div className="gallery-grid">
        {galleryItems.slice(0, showAll ? undefined : 6).map((item) => (
          <article key={item.id || item.title} className={`gallery-card ${item.className || ''}`}>
            <img src={getImageUrl(item.image)} alt={item.title} loading="lazy" />
            <div className="gallery-card__overlay">
              <strong>{item.title}</strong>
            </div>
          </article>
        ))}
      </div>

      {galleryItems.length > 6 && (
        <div className="gallery-action">
          <button className="btn-outline" onClick={() => setShowAll(!showAll)}>
            {showAll ? '🙈 Sembunyikan Foto' : '🖼️ Lihat Semua Foto'}
          </button>
        </div>
      )}
    </section>
  )
}

function SectionHeader({ badge, title, desc }) {
  return (
    <div className="section-heading">
      <span className="section-badge"><span /> {badge}</span>
      <h2 className="section-title">{title}</h2>
      <div className="gold-divider"><span>✦</span></div>
      {desc && <p>{desc}</p>}
    </div>
  )
}

export default GallerySection
