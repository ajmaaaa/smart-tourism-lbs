export const routeNodes = {
    pelabuhan: { id: 'pelabuhan', name: 'Pelabuhan Penyengat', lat: 0.930219, lng: 104.421951 },
    masjid: { id: 'masjid', name: 'Masjid Raya Sultan Riau', lat: 0.929487, lng: 104.420334 },
    makam_rah: { id: 'makam_rah', name: 'Makam Raja Ali Haji', lat: 0.927698, lng: 104.421374 },
    balai_adat: { id: 'balai_adat', name: 'Balai Adat Melayu', lat: 0.927296, lng: 104.414701 },
    istana: { id: 'istana', name: 'Istana Kantor', lat: 0.928224, lng: 104.418912 },
    benteng: { id: 'benteng', name: 'Benteng Bukit Kursi', lat: 0.929366, lng: 104.417737 }
}

export const routeEdges = [
    ['pelabuhan', 'masjid'],
    ['pelabuhan', 'makam_rah'],
    ['pelabuhan', 'balai_adat'],
    ['pelabuhan', 'istana'],
    ['pelabuhan', 'benteng'],
    ['masjid', 'makam_rah'],
    ['masjid', 'balai_adat'],
    ['masjid', 'istana'],
    ['masjid', 'benteng'],
    ['makam_rah', 'balai_adat'],
    ['makam_rah', 'istana'],
    ['makam_rah', 'benteng'],
    ['balai_adat', 'istana'],
    ['balai_adat', 'benteng']
]
