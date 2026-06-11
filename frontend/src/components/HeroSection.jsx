import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import { destinations as fallbackDestinations, PENYENGAT_CENTER, PENYENGAT_ZOOM } from '../data/destinations.js'
import { fetchContent } from '../services/contentService.js'
import { findNearestNode } from '../utils/astar.js'
import { routeNodes } from '../data/routeGraph.js'
import '../styles/hero.css'

const API_BASE = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'http://localhost:5000'
  ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL}/api`)
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000/api'
      : '/api');

async function fetchRoute(start, destination) {
  const fromLat = start.lat
  const fromLng = start.lng
  const toLat = destination.lat
  const toLng = destination.lng

  const response = await fetch(
    `${API_BASE}/route?fromLat=${encodeURIComponent(fromLat)}&fromLng=${encodeURIComponent(fromLng)}&toLat=${encodeURIComponent(toLat)}&toLng=${encodeURIComponent(toLng)}`
  )

  if (!response.ok) {
    throw new Error('Routing request failed')
  }

  const data = await response.json()
  if (!data.routes?.length) {
    throw new Error('No route returned')
  }

  const route = data.routes[0]
  const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng])
  return {
    coordinates,
    distance: Math.round(route.distance),
    nodeNames: route.legs?.[0]?.summary ? route.legs[0].summary.split(' → ') : []
  }
}

const destIcon = new L.DivIcon({
  className: '',
  html: '<div class="hero__marker"><div class="hero__marker-dot"></div></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
})

const activeDestIcon = new L.DivIcon({
  className: '',
  html: '<div class="hero__marker hero__marker--active"><div class="hero__marker-dot"></div></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
})

const userIcon = new L.DivIcon({
  className: '',
  html: '<div class="hero__user-marker"><div class="hero__user-pulse"></div></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
})

function HeroSection() {
  const mapBoxRef = useRef(null)
  const mapRef = useRef(null)
  const destinationLayerRef = useRef(null)
  const userLayerRef = useRef(null)
  const routeLayerRef = useRef(null)

  const [destinations, setDestinations] = useState(fallbackDestinations)
  const [selectedId, setSelectedId] = useState(fallbackDestinations[0].id)
  const [query, setQuery] = useState('')
  const [flyTarget, setFlyTarget] = useState([PENYENGAT_CENTER.lat, PENYENGAT_CENTER.lng])
  const [userPos, setUserPos] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState(false)
  const [route, setRoute] = useState(null)
  const [routeStatus, setRouteStatus] = useState('Pilih tempat rekomendasi, lalu buat rute dari Pelabuhan Penyengat atau posisi Anda.')

  const selectedDestination = useMemo(
    () => destinations.find((item) => item.id === selectedId) || destinations[0] || fallbackDestinations[0],
    [destinations, selectedId]
  )

  const filteredDestinations = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return destinations

    return destinations.filter((dest) => {
      const text = `${dest.name} ${dest.category} ${dest.location} ${dest.shortDesc}`.toLowerCase()
      return text.includes(value)
    })
  }, [destinations, query])

  useEffect(() => {
    fetchContent('/api/destinations', fallbackDestinations).then((items) => {
      if (items.length) setDestinations(items)
    })
  }, [])

  useEffect(() => {
    if (!destinations.some((item) => item.id === selectedId) && destinations[0]) {
      setSelectedId(destinations[0].id)
    }
  }, [destinations, selectedId])

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const selectDestination = useCallback((dest) => {
    setSelectedId(dest.id)
    setFlyTarget([dest.coordinates.lat, dest.coordinates.lng])
    setRoute(null)
    setRouteStatus(`Tujuan dipilih: ${dest.name}. Klik Buat Rute A* untuk melihat jalur.`)
  }, [])

  useEffect(() => {
    const handler = (event) => {
      const destId = event.detail?.destId
      const dest = destinations.find((item) => item.id === destId)
      if (dest) selectDestination(dest)
    }

    window.addEventListener('select-destination', handler)
    return () => window.removeEventListener('select-destination', handler)
  }, [destinations, selectDestination])

  useEffect(() => {
    if (!mapBoxRef.current || mapRef.current) return

    const map = L.map(mapBoxRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true
    }).setView([PENYENGAT_CENTER.lat, PENYENGAT_CENTER.lng], PENYENGAT_ZOOM)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
    }).addTo(map)

    destinationLayerRef.current = L.layerGroup().addTo(map)
    userLayerRef.current = L.layerGroup().addTo(map)
    routeLayerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    setTimeout(() => map.invalidateSize(), 250)

    return () => {
      map.remove()
      mapRef.current = null
      destinationLayerRef.current = null
      userLayerRef.current = null
      routeLayerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !destinationLayerRef.current) return

    destinationLayerRef.current.clearLayers()
    destinations.forEach((dest) => {
      const marker = L.marker([dest.coordinates.lat, dest.coordinates.lng], {
        icon: dest.id === selectedId ? activeDestIcon : destIcon
      })
        .bindPopup(`<strong>${dest.name}</strong><br><span>${dest.shortDesc}</span>`)
        .on('click', () => selectDestination(dest))

      marker.addTo(destinationLayerRef.current)
    })
  }, [destinations, selectedId, selectDestination])

  useEffect(() => {
    if (!mapRef.current) return

    if (route?.coordinates?.length) {
      mapRef.current.fitBounds(route.coordinates, { padding: [34, 34] })
      return
    }

    if (flyTarget) {
      mapRef.current.flyTo(flyTarget, 16, { duration: 1.1 })
    }
  }, [flyTarget, route])

  useEffect(() => {
    if (!userLayerRef.current) return

    userLayerRef.current.clearLayers()
    if (!userPos) return

    L.marker([userPos.lat, userPos.lng], { icon: userIcon })
      .bindPopup('Posisi Anda')
      .addTo(userLayerRef.current)

    L.circle([userPos.lat, userPos.lng], {
      radius: 42,
      color: '#2563eb',
      fillColor: '#2563eb',
      fillOpacity: 0.12,
      weight: 1.5
    }).addTo(userLayerRef.current)
  }, [userPos])

  useEffect(() => {
    if (!routeLayerRef.current) return

    routeLayerRef.current.clearLayers()
    if (!route?.coordinates?.length) return

    L.polyline(route.coordinates, {
      color: '#b8782a',
      weight: 5,
      opacity: 0.9
    }).addTo(routeLayerRef.current)
  }, [route])

  const handleLocateSuccess = useCallback((coords) => {
    setLocating(false)
    setUserPos(coords)
    setLocError(false)
    setRoute(null)
    setFlyTarget([coords.lat, coords.lng])
    setRouteStatus('Posisi berhasil ditemukan. Pilih tujuan, lalu klik Buat Rute A*.')
  }, [])

  const handleLocateError = useCallback(() => {
    setLocating(false)
    setLocError(true)
    setRouteStatus('Posisi tidak terbaca. Sistem akan memakai Pelabuhan Penyengat sebagai titik awal demo.')
  }, [])

  const startLocate = () => {
    if (!navigator.geolocation) {
      handleLocateError()
      return
    }

    setLocating(true)
    setLocError(false)
    setRouteStatus('Melacak posisi Anda...')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleLocateSuccess({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      handleLocateError,
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const createRoute = async () => {
    const startNode = userPos ? findNearestNode(userPos) : routeNodes.pelabuhan
    const startName = userPos ? 'Posisi Anda' : routeNodes.pelabuhan.name

    const destNode = routeNodes[selectedDestination.routeNodeId] || findNearestNode(selectedDestination.coordinates)

    setRouteStatus('Mengambil rute...')

    try {
      const result = await fetchRoute(startNode, destNode)
      setRoute(result)
      setRouteStatus(`Rute ${startName} ke ${selectedDestination.name}: ${result.distance} meter.`)
    } catch (error) {
      console.error(error)
      setRoute(null)
      setRouteStatus('Gagal membuat rute. Coba lagi atau periksa koneksi.')
    }
  }

  return (
    <section id="beranda" className="hero">
      <div className="hero__shade" />
      <div className="hero__motif" aria-hidden="true" />

      <div className="hero__inner">
        <div className="hero__content">
          <div className="hero__eyebrow">
            <span>✦</span>
            Wisata sejarah dan budaya Melayu
          </div>

          <span className="hero__label">Selamat datang di</span>
          <h1 className="hero__title">Pulau<br /><em>Penyengat</em></h1>

          <p className="hero__desc">
            Jelajahi peninggalan Kesultanan Riau-Lingga, budaya Melayu, kuliner lokal,
            dan rute wisata cerdas dalam satu panduan yang mudah digunakan.
          </p>

          <div className="hero__actions">
            <button className="btn-primary" type="button" onClick={() => scrollToSection('destinasi')}>
              Lihat Destinasi <span>↗</span>
            </button>
            <button className="btn-secondary hero__btn-secondary" type="button" onClick={() => scrollToSection('panduan')}>
              Panduan Kunjungan
            </button>
          </div>

          <div className="hero__facts" aria-label="Ringkasan fitur">
            <div className="hero__fact">
              <span>↝</span>
              <div><strong>±15 menit</strong><small>penyeberangan pompong</small></div>
            </div>
            <div className="hero__fact">
              <span>⌖</span>
              <div><strong>Rute A*</strong><small>navigasi antardestinasi</small></div>
            </div>
            <div className="hero__fact">
              <span>✦</span>
              <div><strong>Pak Cik</strong><small>asisten wisata berbasis AI</small></div>
            </div>
          </div>
        </div>

        <div className="hero__map-wrap">
          <div className="hero__map-card">
            <div className="hero__map-header">
              <div>
                <span className="hero__map-kicker">Peta Interaktif</span>
                <h2>Temukan rute wisata Anda</h2>
              </div>
              <span className="hero__live-badge"><span /> LBS Aktif</span>
            </div>

            <div className="hero__search-row">
              <label className="hero__search-input">
                <span>⌕</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari masjid, makam, benteng..."
                  aria-label="Cari destinasi"
                />
              </label>
              <button type="button" onClick={startLocate} className={locError ? 'is-error' : ''}>
                {locating ? 'Melacak...' : locError ? 'Coba Lagi' : 'Lacak Posisi'}
              </button>
            </div>

            <div className="hero__map-box" ref={mapBoxRef} aria-label="Peta Pulau Penyengat" />

            <div className="hero__route-panel">
              <div>
                <span>Tujuan yang dipilih</span>
                <strong>{selectedDestination.name}</strong>
              </div>
              <button type="button" onClick={createRoute}>Buat Rute A*</button>
            </div>

            <p className="hero__route-status">{routeStatus}</p>

            {route?.nodeNames?.length > 0 && (
              <div className="hero__route-list">
                <strong>Urutan jalur:</strong>
                <span>{route.nodeNames.join(' → ')}</span>
              </div>
            )}

            <div className="hero__recommendation-title">Rekomendasi tempat</div>
            <div className="hero__recommendations">
              {filteredDestinations.slice(0, 5).map((dest) => (
                <button
                  type="button"
                  key={dest.id}
                  className={`hero__place ${selectedId === dest.id ? 'active' : ''}`}
                  onClick={() => selectDestination(dest)}
                >
                  <span className="hero__place-icon">{getDestinationIcon(dest.category)}</span>
                  <span>
                    <strong>{dest.name}</strong>
                    <small>{dest.category} · {dest.location}</small>
                  </span>
                </button>
              ))}

              {filteredDestinations.length === 0 && (
                <div className="hero__empty-result">Destinasi tidak ditemukan.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <button className="hero__scroll" type="button" onClick={() => scrollToSection('tentang')} aria-label="Lanjut ke bagian tentang">
        <span>Gulir untuk menjelajah</span>
        <strong>↓</strong>
      </button>
    </section>
  )
}

function getDestinationIcon(category) {
  if (category === 'Religi') return '🕌'
  if (category === 'Sejarah') return '🏛️'
  if (category === 'Budaya') return '✦'
  if (category === 'Transportasi') return '⛵'
  if (category === 'Alam') return '≈'
  return '⌖'
}

export default HeroSection
