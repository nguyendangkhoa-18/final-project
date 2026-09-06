import { OPENWEATHER_API_KEY } from './config.js';

export async function getWeatherData(cityName) {
    const weatherElem = document.getElementById('weather-content');
    if (!weatherElem) return;

    weatherElem.innerHTML = "<p style='color:#00f090;'>Đang truy xuất dữ liệu thời tiết...</p>";

    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&lang=vi&appid=${OPENWEATHER_API_KEY}`);
        if (!res.ok) throw new Error('Không thể tải dữ liệu thời tiết');
        const data = await res.json();

        const current = data.list[0];
        const city = data.city.name;

        const hourlyItemsHTML = data.list.slice(0, 8).map(item => {
            const timeStr = new Date(item.dt * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            return `
                <div class="hourly-item">
                    <span class="time">${timeStr}</span>
                    <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="icon">
                    <span class="temp">${Math.round(item.main.temp)}°C</span>
                </div>
            `;
        }).join('');

        const dailyList = data.list.filter((_, index) => index % 8 === 0).slice(0, 5);
        const daysOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        
        const weeklyBarHTML = dailyList.map((item, idx) => {
            const dateObj = new Date(item.dt * 1000);
            const dayName = idx === 0 ? 'Hôm nay' : daysOfWeek[dateObj.getDay()];
            return `
                <div class="weekly-item ${idx === 0 ? 'active' : ''}">
                    <div>${dayName} ${Math.round(item.main.temp)}°</div>
                </div>
            `;
        }).join('');

        weatherElem.innerHTML = `
            <div class="weather-container-modern">
                <div class="weather-weekly-bar">${weeklyBarHTML}</div>
                <div class="weather-main-grid">
                    <div class="weather-current-card">
                        <div>
                            <div class="weather-header-now">
                                <span>${city}</span>
                                <span>${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div class="weather-temp-huge">
                                ${Math.round(current.main.temp)}°C
                                <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png" style="width:50px;">
                            </div>
                            <div class="weather-desc-text">${current.weather[0].description}</div>
                        </div>
                        <div class="weather-details-grid">
                            <div class="detail-box">Gió <b>${current.wind.speed} m/s</b></div>
                            <div class="detail-box">Độ ẩm <b>${current.main.humidity}%</b></div>
                            <div class="detail-box">Áp suất <b>${current.main.pressure} hPa</b></div>
                            <div class="detail-box">Tầm nhìn <b>${(current.visibility / 1000).toFixed(1)} km</b></div>
                        </div>
                    </div>
                    <div class="weather-hourly-card">
                        <div class="hourly-title">Dự báo theo giờ</div>
                        <div class="hourly-list">${hourlyItemsHTML}</div>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        weatherElem.innerHTML = `<p style="color:var(--danger-red);">Lỗi tải thời tiết: ${err.message}</p>`;
    }
}