import React from 'react'

const galleryItems = [
  { title: 'Masjid Sultan Riau',  image: '/images/gallery-masjid.jpg',   className: 'tall' },
  { title: 'Dermaga Pompong',     image: '/images/gallery-dermaga.jpg' },
  { title: 'Tepi Laut Penyengat', image: '/images/gallery-laut.jpg',     className: 'wide' },
  { title: 'Benteng Bukit Kursi', image: '/images/gallery-benteng.jpg' },
  { title: 'Senja Penyengat',     image: '/images/gallery-sunset.jpg' },
  { title: 'Kuliner Melayu',      image: '/images/gallery-kuliner.jpg' },
  { title: 'Budaya Melayu',       image: '/images/gallery-budaya.jpg',   className: 'wide' },
  { title: 'Makam Bersejarah',    image: '/images/gallery-makam.jpg' },
  { title: 'Rumah Adat',          image: '/images/gallery-adat.jpg' }
]

function GallerySection() {
  return (
    <section id="galeri" className="section gallery-section">
      <SectionHeader badge="Galeri" title="Galeri Foto" desc="Keindahan Pulau Penyengat dari berbagai sudut pandang." />
      <div className="gallery-grid">
        {galleryItems.map((item, index) => (
          <article key={`${item.title}-${index}`} className={`gallery-card ${item.className || ''}`}>
            <img src={item.image} alt={item.title} loading="lazy"
              onError={(e) => { e.currentTarget.src = '/images/gallery-laut.jpg' }} />
            <div className="gallery-card__overlay">
              <strong>{item.title}</strong>
            </div>
          </article>
        ))}
      </div>
      <div className="gallery-action">
        <button className="btn-outline">🖼️ Lihat Semua Foto</button>
      </div>
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
