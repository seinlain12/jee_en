const UI = {
    contentArea: () => document.getElementById('content'),

    renderLogs: function() {
        const dates = Object.keys(studyData.logs).sort().reverse();
        let html = `
            <h2>📅 공부 기록</h2>
            <button class="add-btn" onclick="App.askNewDate()">+ 날짜 추가</button>
            <ul class="date-list">
                ${dates.map(date => `<li onclick="UI.renderLogDetail('${date}')">${date}</li>`).join('')}
            </ul>`;
        this.contentArea().innerHTML = html;
    },

    renderLogDetail: function(date) {
        const log = studyData.logs[date];
        let html = `
            <div class="detail-header">
                <span class="back-link" onclick="UI.renderLogs()">← 목록으로</span>
                <h2>📅 ${date} 공부 내용</h2>
            </div>

            <div class="chat-container">
                ${log.chats.map(chat => `
                    <div class="chat-bubble ${chat.role}">
                        <div class="bubble-content">${chat.text.replace(/\n/g, '<br>')}</div>
                    </div>
                `).join('')}
            </div>

            <div class="input-section">
                <h3>✍️ 새 대화 추가</h3>
                <textarea id="geminiIn" placeholder="Gemini가 한 말"></textarea>
                <textarea id="meIn" placeholder="내가 한 말"></textarea>
                <div class="btn-group">
                    <button class="white-btn" onclick="App.addChat('${date}')">➕ 대화 추가</button>
                    <button class="brown-btn" onclick="App.saveData()">💾 저장</button>
                </div>
            </div>

            <div class="sentence-section">
                <h3>⭐ 필수 문장</h3>
                <div class="sentence-input-group">
                    <input type="text" id="sentenceIn" placeholder="영어 문장 입력">
                    <button onclick="App.addSentence('${date}')">+ 추가</button>
                </div>
                <div id="sentenceList">
                    ${log.sentences.map((s, i) => `
                        <div class="sentence-item-card">
                            <div class="s-content">
                                <strong>${s.text}</strong>
                                <span>${s.trans}</span>
                            </div>
                            <div class="s-actions">
                                <button class="speak-btn" onclick="App.speak('${s.text.replace(/'/g, "\\'")}')">🔊</button>
                                <button class="del-x" onclick="App.delSentence('${date}', ${i})">❌</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <button class="delete-all-btn" onclick="App.deleteFullDate('${date}')">🗑️ 날짜 삭제</button>
        `;
        this.contentArea().innerHTML = html;
    },

    renderSentencesPage: function() {
        let html = `<h2>⭐ 필수 문장 모음</h2>`;
        let hasContent = false;
        for (const date in studyData.logs) {
            if (studyData.logs[date].sentences.length > 0) {
                hasContent = true;
                html += `<div class="date-group-title">${date}</div>`;
                studyData.logs[date].sentences.forEach(s => {
                    html += `
                        <div class="sentence-item-card all-view">
                            <div class="s-content">
                                <strong>${s.text}</strong>
                                <p>${s.trans}</p>
                            </div>
                            <button class="speak-btn-all" onclick="App.speak('${s.text.replace(/'/g, "\\'")}')">🔊 발음 듣기</button>
                        </div>`;
                });
            }
        }
        this.contentArea().innerHTML = hasContent ? html : "<h2>⭐ 필수 문장</h2><p>저장된 문장이 없습니다.</p>";
    }
};