const UI = {
    // 콘텐츠가 표시될 메인 영역 지정
    contentArea: () => document.getElementById('content'),

    // 1. 메인 화면: 날짜별 공부 기록 목록 렌더링
    renderLogs: function() {
        const dates = studyData.logs ? Object.keys(studyData.logs).sort().reverse() : [];
        let html = `
            <h2>📅 공부 기록</h2>
            <button class="add-btn" onclick="App.askNewDate()">+ 날짜 추가</button>
            <ul class="date-list">
                ${dates.map(date => `<li onclick="UI.renderLogDetail('${date}')">${date}</li>`).join('')}
            </ul>`;
        this.contentArea().innerHTML = html;
    },

    // 2. 상세 화면: 특정 날짜의 대화 내용 및 필수 문장 렌더링
    renderLogDetail: function(date) {
        const log = studyData.logs[date] || { chats: [], sentences: [] };
        
        // 데이터 누락 방지를 위한 초기화
        const chats = log.chats || [];
        const sentences = log.sentences || [];

        let html = `
            <div class="detail-header">
                <span class="back-link" style="cursor:pointer; color: #888;" onclick="UI.renderLogs()">← 목록으로</span>
                <h2 style="margin-top:10px;">📅 ${date} 공부 내용</h2>
            </div>

            <div class="chat-container">
                ${chats.length === 0 ? 
                    '<p style="color:#999; text-align:center; padding:20px;">등록된 대화가 없습니다. 아래에서 추가해보세요!</p>' : 
                    chats.map(chat => `
                        <div class="chat-bubble ${chat.role}">
                            <div class="bubble-content">${chat.text.replace(/\n/g, '<br>')}</div>
                        </div>
                    `).join('')
                }
            </div>

            <div class="input-section">
                <h3>✍️ 새 대화 추가</h3>
                <textarea id="geminiIn" placeholder="Gemini가 한 말 (답변 내용)"></textarea>
                <textarea id="meIn" placeholder="내가 한 말 (질문 내용)"></textarea>
                <div class="btn-group">
                    <button class="white-btn" onclick="App.addChat('${date}')">➕ 대화 추가</button>
                    <button class="brown-btn" onclick="App.saveData()">💾 클라우드 저장</button>
                </div>
            </div>

            <div class="sentence-section">
                <h3>⭐ 필수 문장</h3>
                <div class="sentence-input-group" style="display:flex; gap:5px; margin-bottom:10px;">
                    <input type="text" id="sentenceIn" placeholder="영어 문장 입력" style="flex:1; margin-bottom:0;">
                    <button class="brown-btn" onclick="App.addSentence('${date}')" style="padding:0 15px;">+ 추가</button>
                </div>
                <div id="sentenceList">
                    ${sentences.map((s, i) => `
                        <div class="sentence-item-card">
                            <div class="s-content">
                                <strong>${s.text}</strong>
                                <span>${s.trans}</span>
                            </div>
                            <div class="s-actions">
                                <button onclick="App.speak('${s.text.replace(/'/g, "\\'")}')">🔊</button>
                                <button class="del-x" onclick="App.delSentence('${date}', ${i})" style="border:none; background:none; cursor:pointer;">❌</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <button class="delete-all-btn" onclick="App.deleteFullDate('${date}')">🗑️ 날짜 삭제</button>
        `;
        this.contentArea().innerHTML = html;
    },

    // 3. 문장 모음 화면: 모든 날짜의 문장을 한꺼번에 확인
    renderSentencesPage: function() {
        let html = `<h2>⭐ 필수 문장 모음</h2>`;
        let hasSentence = false;

        for (const date in studyData.logs) {
            const sentences = studyData.logs[date].sentences || [];
            sentences.forEach(s => {
                hasSentence = true;
                html += `
                    <div class="sentence-item-card all-view">
                        <div class="s-content">
                            <strong>${s.text}</strong>
                            <p style="font-size:14px; color:#666;">${s.trans}</p>
                            <small style="color:#bbb;">📅 ${date}</small>
                        </div>
                        <button class="speak-btn-all" onclick="App.speak('${s.text.replace(/'/g, "\\'")}')" 
                                style="background:#fff; border:1px solid #ddd; padding:5px 10px; border-radius:5px; cursor:pointer;">
                            🔊 발음
                        </button>
                    </div>`;
            });
        }

        if (!hasSentence) html += '<p style="text-align:center; padding:50px; color:#999;">저장된 문장이 없습니다.</p>';
        this.contentArea().innerHTML = html;
    },

    // 4. 테스트 화면: 랜덤으로 한 문장을 선택해 퀴즈 진행
    renderTestPage: function(sentenceObj) {
        let html = `
            <div class="test-container">
                <h2>🎲 랜덤 문장 테스트</h2>
                <div class="test-card">
                    <p style="color:#666; margin-bottom:10px;">이 문장은 무슨 뜻일까요?</p>
                    <h3 style="font-size:20px; margin-bottom:15px; color:#333;">${sentenceObj.text}</h3>
                    <button class="test-speak-btn" onclick="App.speak('${sentenceObj.text.replace(/'/g, "\\'")}')"
                            style="margin-bottom:20px; background:none; border:1px solid #eee; padding:5px 15px; border-radius:20px; cursor:pointer;">
                        🔊 발음 듣기
                    </button>
                    <div class="test-answer-area">
                        <input type="text" id="testInput" placeholder="뜻을 입력하세요 (엔터 가능)" 
                               onkeypress="if(event.keyCode==13) App.checkAnswer()">
                        <button class="brown-btn" onclick="App.checkAnswer()">정답 확인</button>
                    </div>
                    <div id="testResult"></div>
                    <button class="white-btn next-test-btn" onclick="App.startRandomTest()" style="width:100%; margin-top:20px;">
                        다른 문제 풀기 ➡️
                    </button>
                </div>
            </div>`;
        this.contentArea().innerHTML = html;
    }
};