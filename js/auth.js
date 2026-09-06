export function initAuth() {
    const authBtn = document.getElementById('auth-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const authForm = document.getElementById('auth-form');
    const toggleAuth = document.getElementById('toggle-auth');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-btn');
    const userDisplay = document.getElementById('user-display');
    
    const popup = document.getElementById('google-profile-popup');
    const popupAvatar = document.getElementById('popup-avatar');
    const popupName = document.getElementById('popup-name');
    const popupEmail = document.getElementById('popup-email');
    const btnPopupLogout = document.getElementById('btn-popup-logout');
    const btnManageAccount = document.getElementById('btn-manage-account');

    const profilePageModal = document.getElementById('profile-page-modal');
    const closeProfileModal = document.getElementById('close-profile-modal');

    let isLoginMode = true;
    let currentUser = localStorage.getItem('emerald_user') || null;

    function getSearchCount() {
        return localStorage.getItem(`search_count_${currentUser}`) || 0;
    }

    function getFavs() {
        return JSON.parse(localStorage.getItem(`favs_${currentUser}`)) || [];
    }

    function updateUI() {
        if (currentUser) {
            const initial = currentUser.charAt(0).toUpperCase();
            userDisplay.innerHTML = `<div id="avatar-btn" class="avatar-btn">${initial}</div>`;
            authBtn.style.display = 'none';

            popupAvatar.textContent = initial;
            popupName.textContent = currentUser;
            popupEmail.textContent = `${currentUser.toLowerCase().replace(/\s+/g, '')}@gmail.com`;

            // Avatar click toggles Google Pop-up
            document.getElementById('avatar-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                popup.classList.toggle('hidden');
            });
        } else {
            userDisplay.innerHTML = '';
            authBtn.style.display = 'block';
            authBtn.textContent = 'Đăng Nhập';
            popup.classList.add('hidden');
        }
    }

    updateUI();

    document.addEventListener('click', () => popup.classList.add('hidden'));

    authBtn.addEventListener('click', () => modalOverlay.classList.remove('hidden'));

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
    });

    toggleAuth.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        modalTitle.textContent = isLoginMode ? 'Đăng Nhập' : 'Đăng Ký';
        submitBtn.textContent = isLoginMode ? 'Đăng Nhập' : 'Đăng Ký';
        toggleAuth.textContent = isLoginMode ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập ngay';
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        if (username) {
            currentUser = username;
            localStorage.setItem('emerald_user', username);
            updateUI();
            modalOverlay.classList.add('hidden');
            authForm.reset();
        }
    });

    btnPopupLogout.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('emerald_user');
        updateUI();
    });

    // Mở trang Hồ sơ cá nhân dạng cửa sổ Youtube Card
    btnManageAccount.addEventListener('click', () => {
        popup.classList.add('hidden');
        if (!currentUser) return;

        document.getElementById('profile-big-avatar').textContent = currentUser.charAt(0).toUpperCase();
        document.getElementById('profile-page-name').textContent = currentUser;
        document.getElementById('profile-page-email').textContent = `${currentUser.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
        
        document.getElementById('stat-search-count').textContent = getSearchCount();
        
        const favs = getFavs();
        document.getElementById('stat-fav-count').textContent = favs.length;

        const youtubeGrid = document.getElementById('fav-youtube-grid');
        youtubeGrid.innerHTML = '';

        if (favs.length === 0) {
            youtubeGrid.innerHTML = '<p style="color:#888;">Chưa có dữ liệu yêu thích.</p>';
        } else {
            favs.forEach(item => {
                const card = document.createElement('div');
                card.className = 'youtube-card';
                card.innerHTML = `
                    <div class="youtube-thumb">
                        ${item.img ? `<img src="${item.img}">` : '<span style="font-size:2rem;">🐾</span>'}
                    </div>
                    <div class="youtube-info">
                        <div class="youtube-title">${item.title}</div>
                        <div class="youtube-desc">${item.desc}</div>
                    </div>
                `;
                youtubeGrid.appendChild(card);
            });
        }

        profilePageModal.classList.remove('hidden');
    });

    closeProfileModal.addEventListener('click', () => profilePageModal.classList.add('hidden'));
}