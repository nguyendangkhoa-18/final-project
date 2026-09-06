import { GEMINI_API_KEY } from './config.js';

export function initChatbot() {
    const chatCircle = document.getElementById('chat-circle');
    const chatBox = document.getElementById('chat-box');
    const closeBtn = document.getElementById('chat-box-toggle');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input-text');
    const chatLogs = document.getElementById('chat-logs');

    if (!chatCircle || !chatBox) return;

    chatCircle.addEventListener('click', () => {
        chatBox.classList.toggle('hidden');
    });

    closeBtn.addEventListener('click', () => {
        chatBox.classList.add('hidden');
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (!msg) return;

        const userDiv = document.createElement('div');
        userDiv.className = 'user-msg';
        userDiv.textContent = `Bạn: ${msg}`;
        chatLogs.appendChild(userDiv);

        chatInput.value = '';
        chatLogs.scrollTop = chatLogs.scrollHeight;

        const botDiv = document.createElement('div');
        botDiv.className = 'bot-msg';
        botDiv.textContent = 'AI: Đang suy nghĩ...';
        chatLogs.appendChild(botDiv);
        chatLogs.scrollTop = chatLogs.scrollHeight;

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Trả lời ngắn gọn câu hỏi về động vật: ${msg}` }] }]
                })
            });
            const data = await res.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi.";
            botDiv.textContent = `AI: ${reply}`;
        } catch (err) {
            botDiv.textContent = 'AI: Lỗi kết nối API!';
        }
        chatLogs.scrollTop = chatLogs.scrollHeight;
    });
}