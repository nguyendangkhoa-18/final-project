import { animalDatabase } from './config.js';
import { initMatrix } from './matrix.js';
import { initAuth } from './auth.js';
import { getWeatherData } from './weather.js';
import { initMap } from './map.js';
import { load3DModel } from './viewer3d.js';
import { initChatbot } from './chatbot.js';

document.addEventListener('DOMContentLoaded', () => {
    initMatrix();
    initAuth();
    initChatbot();

    // TÍNH NĂNG 3: Bút Highlight thông tin
    const highlighterBtn = document.getElementById('highlighter-btn');
    let isHighlightMode = false;

    highlighterBtn.addEventListener('click', () => {
        isHighlightMode = !isHighlightMode;
        highlighterBtn.classList.toggle('active', isHighlightMode);
        document.body.classList.toggle('highlight-mode', isHighlightMode);
    });

    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const resultContainer = document.getElementById('result-container');

    function incrementSearchCount() {
        const user = localStorage.getItem('emerald_user');
        if (user) {
            const count = parseInt(localStorage.getItem(`search_count_${user}`) || '0') + 1;
            localStorage.setItem(`search_count_${user}`, count);
        }
    }

    async function fetchAnimalData(query) {
        const key = query.toLowerCase().trim();
        resultContainer.innerHTML = '<div class="card">Đang truy xuất dữ liệu...</div>';
        incrementSearchCount();

        try {
            const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Không tìm thấy dữ liệu con vật.');
            const data = await response.json();

            const customData = animalDatabase[key] || {
                coords: [10.8231, 106.6297],
                city: "Ho Chi Minh",
                habitatName: "Môi trường tự nhiên"
            };

            const valid3DKeys = ['lion', 'deer', 't-rex', 'tyrannosaurus', 'fox'];
            const has3DModel = valid3DKeys.includes(key);

            // TÍNH NĂNG 4: Kiểm tra trạng thái Favourite Ngôi Sao
            const user = localStorage.getItem('emerald_user');
            let isFav = false;
            if (user) {
                const favs = JSON.parse(localStorage.getItem(`favs_${user}`)) || [];
                isFav = favs.some(f => f.title.toLowerCase() === data.title.toLowerCase());
            }

            resultContainer.innerHTML = `
                <div class="card">
                    <span id="star-btn" class="fav-star ${isFav ? 'active' : ''}">★</span>
                    <section id="sec-info">
                        <h3 style="color:var(--emerald-primary); font-size:1.4rem;">${data.title}</h3>
                        ${data.thumbnail ? `<img src="${data.thumbnail.source}" style="max-width:200px; margin:10px 0; border:1px solid var(--emerald-primary);">` : ''}
                        <p>${data.extract}</p>
                    </section>

                    <section id="sec-habitat">
                        <h4 style="margin-top:15px; color:var(--emerald-primary);">Nơi Sinh Sống: ${customData.habitatName}</h4>
                        <div id="map"></div>
                    </section>

                    <section id="sec-weather">
                        <h4 style="margin-top:15px; color:var(--emerald-primary);">Thời Tiết Hôm Nay Tại (${customData.city})</h4>
                        <div id="weather-content"></div>
                    </section>

                    ${has3DModel ? `
                    <section id="sec-model3d" style="margin-top: 25px;">
                        <h4 style="color:var(--emerald-primary);">MÔ HÌNH 3D INTERACTIVE: ${key.toUpperCase()}</h4>
                        <div id="canvas3d-wrapper"></div>
                        <div style="margin-top:10px; display:flex; gap:10px;">
                            <button class="btn-action btn-primary" data-action="eat">🍴 Ăn</button>
                            <button class="btn-action btn-primary" data-action="rest">🛏️ Nghỉ ngơi</button>
                            <button class="btn-action btn-primary" data-action="walk">🚶 Đi lại</button>
                        </div>
                    </section>
                    ` : ''}
                </div>
            `;

            // Xử lý sự kiện bấm Ngôi sao Yêu thích
            document.getElementById('star-btn').addEventListener('click', () => {
                const activeUser = localStorage.getItem('emerald_user');
                if (!activeUser) {
                    alert('Vui lòng đăng nhập để sử dụng tính năng Yêu thích!');
                    return;
                }

                let favs = JSON.parse(localStorage.getItem(`favs_${activeUser}`)) || [];
                const index = favs.findIndex(f => f.title.toLowerCase() === data.title.toLowerCase());

                const starBtn = document.getElementById('star-btn');
                if (index > -1) {
                    favs.splice(index, 1);
                    starBtn.classList.remove('active');
                } else {
                    favs.push({
                        title: data.title,
                        desc: data.extract,
                        img: data.thumbnail ? data.thumbnail.source : ''
                    });
                    starBtn.classList.add('active');
                }
                localStorage.setItem(`favs_${activeUser}`, JSON.stringify(favs));
            });

            initMap(customData);
            getWeatherData(customData.city);

            if (has3DModel) {
                setTimeout(() => load3DModel(key), 100);
            }

        } catch (err) {
            resultContainer.innerHTML = `<div class="card" style="color:var(--danger-red);">${err.message}</div>`;
        }
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const q = searchInput.value.trim();
            if (q) fetchAnimalData(q);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const q = searchInput.value.trim();
                if (q) fetchAnimalData(q);
            }
        });
    }
});