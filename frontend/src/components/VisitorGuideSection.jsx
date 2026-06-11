import React, { useEffect, useMemo, useState } from 'react'
import { fetchContent } from '../services/contentService.js'

const fallbackTransportation = [
  { id: 'pompong', title: 'Pompong dari Tanjungpinang', summary: 'Gunakan pompong dari dermaga Tanjungpinang menuju Pulau Penyengat. Perjalanan laut berlangsung singkat.' },
  { id: 'jalan-kaki', title: 'Jalan kaki', summary: 'Banyak titik wisata dapat dijelajahi dengan berjalan kaki karena jarak antarlokasi relatif dekat.' },
  { id: 'becak', title: 'Becak lokal', summary: 'Becak dapat digunakan untuk menjangkau beberapa lokasi dengan lebih nyaman.' }
]

const fallbackHistory = [
  { id: 'sejarah-pusat-melayu', title: 'Pusat sejarah Melayu', summary: 'Pulau Penyengat berkembang sebagai pusat pemerintahan, keagamaan, dan kebudayaan Melayu.' },
  { id: 'sejarah-raja-ali-haji', title: 'Jejak Raja Ali Haji', summary: 'Pulau Penyengat berkaitan erat dengan Raja Ali Haji dan perkembangan bahasa serta sastra Melayu.' },
  { id: 'sejarah-situs', title: 'Situs bersejarah', summary: 'Masjid Raya Sultan Riau, makam, benteng, dan bangunan lama menjadi bagian penting perjalanan wisata.' }
]

const fallbackFaq = [
  { id: 'faq-akses', title: 'Bagaimana cara menuju Pulau Penyengat?', summary: 'Wisatawan dapat menyeberang menggunakan pompong dari dermaga di Tanjungpinang.' },
  { id: 'faq-rute', title: 'Apakah website dapat membantu menentukan rute?', summary: 'Ya. Pilih destinasi pada peta, lalu gunakan tombol Buat Rute A* untuk melihat jalur.' },
  { id: 'faq-ai', title: 'Apa fungsi Pak Cik Penyengat?', summary: 'Pak Cik Penyengat adalah asisten wisata yang membantu menjawab pertanyaan tentang destinasi, transportasi, sejarah, dan budaya.' }
]

function VisitorGuideSection() {
  const [transportation, setTransportation] = useState(fallbackTransportation)
  const [history, setHistory] = useState(fallbackHistory)
  const [faqs, setFaqs] = useState(fallbackFaq)
  const [activeFaq, setActiveFaq] = useState(null)

  useEffect(() => {
    fetchContent('/api/transportation', fallbackTransportation).then((items) => items.length && setTransportation(items))
    fetchContent('/api/history', fallbackHistory).then((items) => items.length && setHistory(items))
    fetchContent('/api/faq', fallbackFaq).then((items) => items.length && setFaqs(items))
  }, [])

  const transportCards = useMemo(() => transportation.slice(0, 4), [transportation])
  const historyCards = useMemo(() => history.slice(0, 4), [history])
  const faqCards = useMemo(() => faqs.slice(0, 6), [faqs])

  return (
    <section id="panduan" className="section guide-section">
      <div className="section-heading">
        <span className="section-badge"><span /> Panduan Kunjungan</span>
        <h2 className="section-title">Rencanakan perjalanan dengan lebih mudah</h2>
        <div className="gold-divider"><span>✦</span></div>
        <p>Informasi penting untuk membantu wisatawan memahami akses, sejarah, dan cara menggunakan fitur website.</p>
      </div>

      <div className="guide-layout">
        <div className="guide-column">
          <div className="guide-column__header">
            <span className="guide-column__icon">↝</span>
            <div>
              <small>Akses & mobilitas</small>
              <h3>Transportasi</h3>
            </div>
          </div>
          <div className="guide-list">
            {transportCards.map((item, index) => (
              <article className="guide-card" key={item.id || item.title}>
                <span className="guide-card__number">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="guide-column guide-column--history">
          <div className="guide-column__header">
            <span className="guide-column__icon">✦</span>
            <div>
              <small>Kenali sebelum berkunjung</small>
              <h3>Sejarah Singkat</h3>
            </div>
          </div>
          <div className="guide-list">
            {historyCards.map((item, index) => (
              <article className="guide-card" key={item.id || item.title}>
                <span className="guide-card__number">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="faq-block">
        <div className="faq-block__intro">
          <span className="section-badge"><span /> FAQ</span>
          <h3>Pertanyaan yang sering ditanyakan</h3>
          <p>Buka pertanyaan untuk melihat jawaban singkat. Untuk pertanyaan lain, gunakan asisten wisata Pak Cik Penyengat.</p>
          <button type="button" className="btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}>Tanya Pak Cik</button>
        </div>
        <div className="faq-list">
          {faqCards.map((item, index) => {
            const isOpen = activeFaq === index
            return (
              <article className={`faq-item ${isOpen ? 'is-open' : ''}`} key={item.id || item.title}>
                <button type="button" onClick={() => setActiveFaq(isOpen ? null : index)} aria-expanded={isOpen}>
                  <span>{item.title}</span>
                  <strong>{isOpen ? '−' : '+'}</strong>
                </button>
                {isOpen && <p>{item.summary}</p>}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default VisitorGuideSection
