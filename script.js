// ==========================================
// 1. MATRIX TEXTURE BACKGROUND
// ==========================================
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
const fontSize = 14;
let columns = Math.floor(canvas.width / fontSize);
let drops = Array(columns).fill(1);

function drawMatrix() {
    ctx.fillStyle = 'rgba(7, 10, 8, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00f090';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
setInterval(drawMatrix, 33);

// ==========================================
// 2. AUTHENTICATION (LOCALSTORAGE)
// ==========================================
let isLoginView = true;
let currentUser = localStorage.getItem('currentUser') || null;

const authBtn = document.getElementById('auth-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const submitBtn = document.getElementById('submit-btn');
const toggleAuth = document.getElementById('toggle-auth');
const authForm = document.getElementById('auth-form');
const userDisplay = document.getElementById('user-display');
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const resultContainer = document.getElementById('result-container');

function updateUI() {
    if (currentUser) {
        userDisplay.textContent = `[USER: ${currentUser}]`;
        authBtn.textContent = 'Đăng Xuất';
    } else {
        userDisplay.textContent = '';
        authBtn.textContent = 'Đăng Nhập';
    }
}
updateUI();

authBtn.addEventListener('click', () => {
    if (currentUser) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateUI();
    } else modalOverlay.classList.remove('hidden');
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
});

toggleAuth.addEventListener('click', () => {
    isLoginView = !isLoginView;
    modalTitle.textContent = isLoginView ? 'Đăng Nhập' : 'Đăng Ký';
    submitBtn.textContent = isLoginView ? 'Đăng Nhập' : 'Đăng Ký';
    toggleAuth.textContent = isLoginView ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập';
});

authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (isLoginView) {
        if (users[username] && users[username] === password) {
            currentUser = username;
            localStorage.setItem('currentUser', username);
            modalOverlay.classList.add('hidden');
            updateUI();
            authForm.reset();
        } else alert('Sai tên tài khoản hoặc mật khẩu!');
    } else {
        if (users[username]) alert('Tài khoản đã tồn tại!');
        else {
            users[username] = password;
            localStorage.setItem('users', JSON.stringify(users));
            alert('Đăng ký thành công!');
            isLoginView = true;
            modalTitle.textContent = 'Đăng Nhập';
            submitBtn.textContent = 'Đăng Nhập';
            authForm.reset();
        }
    }
});

// ==========================================
// 3. ANIMAL DATABASE (HABITAT & ANATOMY)
// ==========================================
const animalDatabase = {
    "lion": {
        isExtinct: false,
        coords: [1.3521, 36.8219],
        habitatName: "Đồng cỏ Savanna (Châu Phi)",
        anatomyImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Lion_waiting_in_Namibia.jpg/800px-Lion_waiting_in_Namibia.jpg",
        parts: [
            { name: "Bờm đực (Thẩm mỹ & Bảo vệ)", top: "30%", left: "35%" },
            { name: "Hàm răng sắc nhọn", top: "42%", left: "22%" },
            { name: "Móng vuốt co rút", top: "82%", left: "28%" },
            { name: "Cơ đùi chịu lực", top: "55%", left: "75%" }
        ]
    },
    "tyrannosaurus": {
        isExtinct: true,
        bounds: [[35.0, -110.0], [55.0, -90.0]],
        habitatName: "Lục địa Laramidia (Bắc Mỹ Phấn Trắng)",
        anatomyImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Tyrannosaurus_rex_Holotype.jpg/800px-Tyrannosaurus_rex_Holotype.jpg",
        parts: [
            { name: "Hộp sọ & Răng nanh hóa thạch", top: "25%", left: "78%" },
            { name: "Xương chi trước nhỏ", top: "45%", left: "62%" },
            { name: "Cột sống khổng lồ", top: "35%", left: "45%" },
            { name: "Xương chi sau chịu lực", top: "70%", left: "48%" }
        ]
    },
    "dodo": {
        isExtinct: true,
        bounds: [[-20.5, 57.3], [-20.0, 57.8]],
        habitatName: "Đảo Mauritius (Ấn Độ Dương)",
        anatomyImg: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Dodo_1626.org.jpg/600px-Dodo_1626.org.jpg",
        parts: [
            { name: "Mỏ móc lớn", top: "28%", left: "32%" },
            { name: "Xương cánh thoái hóa", top: "48%", left: "50%" },
            { name: "Chân ngắn chắc khỏe", top: "80%", left: "55%" }
        ]
    }
};

let currentMap = null;

async function fetchAnimalData(query) {
    const key = query.toLowerCase();
    resultContainer.innerHTML = '<div class="status-msg">Đang truy xuất dữ liệu...</div>';

    try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Không tìm thấy thông tin con vật này.');
        const data = await response.json();

        const title = data.title;
        const extract = data.extract;
        const imageUrl = data.originalimage ? data.originalimage.source : (data.thumbnail ? data.thumbnail.source : '');

        const customData = animalDatabase[key] || {
            isExtinct: extract.toLowerCase().includes("extinct"),
            coords: [20.0, 0.0],
            habitatName: "Môi trường tự nhiên",
            anatomyImg: imageUrl,
            parts: [
                { name: "Phần đầu & Giác quan", top: "35%", left: "30%" },
                { name: "Thân & Cơ quan nội tạng", top: "50%", left: "50%" },
                { name: "Hệ chi & Xương di chuyển", top: "75%", left: "60%" }
            ]
        };

        resultContainer.innerHTML = `
            <div class="card">
                ${imageUrl ? `<div class="card-img-wrapper"><img src="${imageUrl}" alt="${title}"></div>` : ''}
                <div class="card-content">
                    <h3>${title} ${customData.isExtinct ? '<span class="extinct-badge">ĐÃ TUYỆT CHỦNG</span>' : ''}</h3>
                    <p>${extract}</p>

                    <h4 class="section-title">Nơi sinh sống: ${customData.habitatName}</h4>
                    <div id="map"></div>

                    <h4 class="section-title">Cấu Tạo Cơ Thể ${customData.isExtinct ? '(Giải Phẫu Hóa Thạch)' : ''}</h4>
                    <p style="font-size:0.85rem; margin-bottom:10px; color:var(--emerald-primary);">* Rê chuột vào các điểm phát sáng để xem bộ phận</p>
                    <div class="anatomy-container">
                        <img src="${customData.anatomyImg || imageUrl}" class="anatomy-img" alt="Anatomy">
                        ${customData.parts.map(p => `<div class="anatomy-point" style="top:${p.top}; left:${p.left};" data-part="${p.name}"></div>`).join('')}
                    </div>
                </div>
            </div>
        `;

        initMap(customData);

    } catch (err) {
        resultContainer.innerHTML = `<div class="status-msg" style="color:var(--danger-red); border-color:var(--danger-red);">${err.message}</div>`;
    }
}

function initMap(data) {
    if (currentMap) currentMap.remove();

    currentMap = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 }).addTo(currentMap);

    if (data.isExtinct) {
        const redBounds = data.bounds || [[10.0, -100.0], [50.0, -60.0]];
        const polygon = L.rectangle(redBounds, { color: "#ff3333", weight: 3, fillColor: "#ff3333", fillOpacity: 0.35 }).addTo(currentMap);
        polygon.bindPopup(`<b>Khu vực tuyệt chủng!</b><br>Ranh giới ghi nhận hóa thạch lịch sử.`).openPopup();
        currentMap.fitBounds(redBounds);
    } else {
        const coords = data.coords || [0, 0];
        const circle = L.circle(coords, { color: '#00f090', fillColor: '#00f090', fillOpacity: 0.4, radius: 800000 }).addTo(currentMap);
        circle.bindPopup(`<b>Khu vực phân bố tự nhiên</b><br>${data.habitatName}`).openPopup();
        currentMap.setView(coords, 4);
    }
}

searchBtn.addEventListener('click', () => { const q = searchInput.value.trim(); if (q) fetchAnimalData(q); });
searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { const q = searchInput.value.trim(); if (q) fetchAnimalData(q); } });

// ==========================================
// 4. THREE.JS 3D INTERACTIVE MODAL
// ==========================================
const modelModal = document.getElementById('model3d-modal');
const modelClose = document.getElementById('model3d-close');
const modelTitle = document.getElementById('model3d-title');
const canvasWrapper = document.getElementById('canvas3d-wrapper');
const actionBtns = document.querySelectorAll('.btn-action');

let scene, camera, renderer, mixer, clock, currentModel, controls;
let animationsMap = {};

const modelRoutes = {
    't-rex': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF-Binary/Fox.glb',
    'tyrannosaurus': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF-Binary/Fox.glb',
    'deer': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF-Binary/Fox.glb',
    'lion': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Fox/glTF-Binary/Fox.glb'
};

function init3DScene() {
    if (renderer) return;

    clock = new THREE.Clock();
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050806);

    camera = new THREE.PerspectiveCamera(45, canvasWrapper.clientWidth / canvasWrapper.clientHeight, 0.1, 1000);
    camera.position.set(0, 50, 150);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f090, 1.5);
    dirLight.position.set(50, 100, 50);
    scene.add(dirLight);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasWrapper.clientWidth, canvasWrapper.clientHeight);
    canvasWrapper.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

function load3DModel(animalKey) {
    init3DScene();
    modelModal.classList.remove('hidden');
    modelTitle.textContent = `MÔ HÌNH 3D: ${animalKey.toUpperCase()}`;

    if (currentModel) scene.remove(currentModel);

    const loader = new THREE.GLTFLoader();
    const url = modelRoutes[animalKey];

    loader.load(url, (gltf) => {
        currentModel = gltf.scene;
        scene.add(currentModel);

        mixer = new THREE.AnimationMixer(currentModel);
        animationsMap = {};

        gltf.animations.forEach((clip, index) => {
            const action = mixer.clipAction(clip);
            if (index === 0) animationsMap['walk'] = action;
            else if (index === 1) animationsMap['eat'] = action;
            else animationsMap['rest'] = action;
        });

        playAnimation('walk');
    });
}

function playAnimation(actionName) {
    if (!mixer) return;
    Object.values(animationsMap).forEach(action => action.stop());
    if (animationsMap[actionName]) animationsMap[actionName].play();
}

actionBtns.forEach(btn => {
    btn.addEventListener('click', () => playAnimation(btn.getAttribute('data-action')));
});

modelClose.addEventListener('click', () => modelModal.classList.add('hidden'));

// Kích hoạt 3D khi nhập tên con vật
searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();
    if (modelRoutes[val]) load3DModel(val);
});

// ==========================================
// 5. CHATBOT AI WIDGET (GEMINI API)
// ==========================================
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // Thay API Key Gemini tại đây

const chatCircle = document.getElementById('chat-circle');
const chatBox = document.getElementById('chat-box');
const chatBoxToggle = document.getElementById('chat-box-toggle');
const chatForm = document.getElementById('chat-form');
const chatInputText = document.getElementById('chat-input-text');
const chatLogs = document.getElementById('chat-logs');

chatCircle.addEventListener('click', () => { chatBox.classList.remove('hidden'); chatCircle.style.display = 'none'; });
chatBoxToggle.addEventListener('click', () => { chatBox.classList.add('hidden'); chatCircle.style.display = 'block'; });

function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-msg', sender);
    const textDiv = document.createElement('div');
    textDiv.classList.add('cm-msg-text');
    textDiv.innerText = text;
    msgDiv.appendChild(textDiv);
    chatLogs.appendChild(msgDiv);
    chatLogs.scrollTop = chatLogs.scrollHeight;
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = chatInputText.value.trim();
    if (!userMessage) return;

    appendMessage(userMessage, 'user');
    chatInputText.value = '';

    appendMessage('Đang phân tích...', 'ai');
    const loadingElem = chatLogs.lastElementChild;

    try {
        const aiResponse = await callGeminiAPI(userMessage);
        loadingElem.querySelector('.cm-msg-text').innerText = aiResponse;
    } catch (error) {
        loadingElem.querySelector('.cm-msg-text').innerText = "Không thể kết nối tới AI vào lúc này.";
    }
});

async function callGeminiAPI(prompt) {
    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
        return "Vui lòng nhập GEMINI_API_KEY trong file script.js để kích hoạt AI Chatbot!";
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}