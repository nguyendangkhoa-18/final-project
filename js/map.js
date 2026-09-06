let currentMap = null;

export function initMap(data) {
    if (currentMap) currentMap.remove();
    currentMap = L.map('map').setView(data.coords, 4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 }).addTo(currentMap);
    L.circle(data.coords, { color: '#00f090', fillColor: '#00f090', fillOpacity: 0.4, radius: 500000 }).addTo(currentMap);
}