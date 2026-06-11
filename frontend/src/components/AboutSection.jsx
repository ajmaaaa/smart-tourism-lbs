import React from 'react'

function AboutSection() {
  const items = [
    { title: 'Sejarah', desc: 'Jejak Kesultanan Riau-Lingga', icon: '⌂' },
    { title: 'Budaya', desc: 'Tradisi Melayu yang tetap hidup', icon: '✦' },
    { title: 'Wisata', desc: 'Situs bersejarah dalam satu pulau', icon: '⌖' },
    { title: 'Kuliner', desc: 'Cita rasa khas Kepulauan Riau', icon: '◌' }
  ]

  return (
    <section id="tentang" className="section about-section">
      <div className="about-layout">
        <div className="about-visual-card">
          <div className="about-visual-card__image">
            <img src="/images/penyengat-about.svg" alt="Ilustrasi suasana Pulau Penyengat" loading="lazy" />
          </div>
          <div className="about-visual-card__caption">
            <span>Permata sejarah Melayu</span>
            <strong>Pulau Penyengat</strong>
          </div>
          <div className="about-badge">
            <span>✦</span>
            <div>
              <strong>Warisan Melayu</strong>
              <small>Sejarah, religi, dan budaya</small>
            </div>
          </div>
        </div>

        <div className="about-content">
          <SectionLabel text="Mengenal Penyengat" />
          <h2 className="section-title section-title--left">Pulau kecil dengan cerita yang besar</h2>
          <GoldDivider align="left" />

          <p>Pulau Penyengat berada di Kota Tanjungpinang, Kepulauan Riau. Pulau ini menyimpan jejak penting Kesultanan Riau-Lingga serta perkembangan bahasa, sastra, dan kebudayaan Melayu.</p>
          <p>Dalam satu perjalanan, wisatawan dapat mengunjungi masjid bersejarah, makam tokoh Melayu, benteng pertahanan, bangunan lama, dan ruang budaya masyarakat setempat.</p>

          <div className="about-mini-grid">
            {items.map((item) => (
              <article className="about-mini-card" key={item.title}>
                <span>{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.desc}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionLabel({ text }) {
  return <span className="section-badge"><span /> {text}</span>
}

function GoldDivider({ align = 'center' }) {
  return <div className={`gold-divider ${align === 'left' ? 'gold-divider--left' : ''}`}><span>✦</span></div>
}

export default AboutSection
