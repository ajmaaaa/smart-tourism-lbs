import React from 'react'

function ContactSection() {
  return (
    <>
      <section id="kontak" className="section contact-page-section">
        <div className="contact-layout">
          <div className="contact-info">
            <span className="section-badge"><span /> Informasi</span>
            <h2 className="section-title section-title--left">Butuh bantuan saat merencanakan kunjungan?</h2>
            <div className="gold-divider gold-divider--left"><span>✦</span></div>
            <p>Gunakan asisten wisata untuk memperoleh jawaban cepat mengenai destinasi, sejarah, transportasi, atau rekomendasi rute di Pulau Penyengat.</p>

            <div className="contact-info__list">
              <ContactItem icon="⌖" title="Lokasi" text="Pulau Penyengat, Kota Tanjungpinang, Kepulauan Riau" />
              <ContactItem icon="↝" title="Akses utama" text="Pompong dari dermaga Tanjungpinang menuju Pulau Penyengat" />
              <ContactItem icon="✦" title="Asisten wisata" text="Pak Cik Penyengat siap membantu melalui tombol chatbot" />
            </div>

            <button className="btn-primary" type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}>
              Tanya Pak Cik <span>↗</span>
            </button>
          </div>

          <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
            <div className="contact-form__heading">
              <small>Kritik & saran</small>
              <h3>Bantu kami meningkatkan layanan</h3>
              <p>Formulir ini dapat dihubungkan ke backend saat kanal penerima masukan sudah ditentukan.</p>
            </div>
            <label>
              <span>Nama</span>
              <input name="name" placeholder="Masukkan nama Anda" />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" placeholder="nama@email.com" />
            </label>
            <label>
              <span>Pesan</span>
              <textarea name="message" placeholder="Tuliskan kritik atau saran Anda..." rows="5" />
            </label>
            <button className="btn-primary" type="submit">Kirim Pesan</button>
          </form>
        </div>
      </section>

      <footer className="footer-section">
        <div className="footer-motif" aria-hidden="true" />
        <div className="footer-grid">
          <div className="footer-intro">
            <div className="footer-brand">
              <img src="/penyengat-mark.svg" alt="" />
              <div>
                <small>Wisata Melayu</small>
                <strong>Explore Penyengat</strong>
              </div>
            </div>
            <p>Panduan digital untuk menjelajahi wisata sejarah, budaya Melayu, dan rute perjalanan di Pulau Penyengat.</p>
          </div>

          <div>
            <h4>Jelajahi</h4>
            <a href="#tentang">Tentang Pulau</a>
            <a href="#panduan">Panduan Kunjungan</a>
            <a href="#destinasi">Destinasi Wisata</a>
            <a href="#budaya">Budaya Melayu</a>
          </div>

          <div>
            <h4>Fitur</h4>
            <a href="#beranda">Peta Interaktif</a>
            <a href="#beranda">Rute</a>
            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}>Asisten Pak Cik</button>
            <a href="#galeri">Galeri Foto</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Explore Penyengat</span>
          <span>Smart Tourism LBS Pulau Penyengat</span>
        </div>
      </footer>
    </>
  )
}

function ContactItem({ icon, title, text }) {
  return (
    <div className="contact-item">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  )
}

export default ContactSection
