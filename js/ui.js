const UI = {
    contentArea: () => document.getElementById('content'),

    renderLogs: function() {
        const dates = studyData.logs ? Object.keys(studyData.logs).sort().reverse() : [];
        let html = `<h2>📅 공부 기록</h2><button class="add-btn" onclick="App.askNewDate()">+ 날짜 추가</button><ul class="date-list">${dates.map(date => `<li onclick="UI.renderLogDetail('${date}')">${date}</li>`).join('')}</ul>`;
        this.contentArea().innerHTML = html;
    },

    renderLogDetail: function(date) {
        const log = studyData.logs[date] || { chats: [], sentences: [] };
        const chats = log.chats || [];
        const sentences = log.sentences || [];

        let html = `
            <div class="detail-header"><span class="back-link" onclick="UI.renderLogs()" style="cursor:pointer; color:#888;">← 목록으로</span><h2>📅 ${date} 공부 내용</h2></div>
            <div class="chat-container" id="chatContainer">
                ${chats.map((chat) => `
                    <div class="chat-row ${chat.role}">
                        <div class="chat-bubble ${chat.role}"><div class="bubble-content">${chat.text.replace(/\n/g, '<br>')}</div></div>
                        <button class="chat-speak-btn" 
                                data-text="${encodeURIComponent(chat.text)}" 
                                onclick="App.speak(decodeURIComponent(this.dataset.text))">🔊</button>
                    </div>
                `).join('')}
            </div>
            <div class="input-section">
                <h3>✍️ 새 대화 추가</h3>
                <textarea id="geminiIn" class="triple-height" placeholder="Gemini가 한 말"></textarea>
                <textarea id="meIn" class="triple-height" placeholder="내가 한 말"></textarea>
                <div class="btn-group"><button class="white-btn" onclick="App.addChat('${date}')">➕ 대화 추가</button><button class="brown-btn" onclick="App.saveData()">💾 저장 완료</button></div>
            </div>
            <div class="sentence-section">
                <h3>⭐ 필수 문장</h3>
                <div class="sentence-input-group" style="display:flex; gap:5px; margin-bottom:10px;"><input type="text" id="sentenceIn" placeholder="영어 문장 입력" style="flex:1; margin-bottom:0;"><button class="brown-btn" onclick="App.addSentence('${date}')">+ 추가</button></div>
                <div id="sentenceList">
                    ${sentences.map((s, i) => `
                        <div class="sentence-item-card">
                            <div class="s-content"><strong>${s.text}</strong><span>${s.trans}</span></div>
                            <div class="s-actions">
                                <button data-text="${encodeURIComponent(s.text)}" onclick="App.speak(decodeURIComponent(this.dataset.text))">🔊</button>
                                <button class="del-x" onclick="App.delSentence('${date}', ${i})">❌</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <button class="delete-all-btn" onclick="App.deleteFullDate('${date}')">🗑️ 날짜 삭제</button>
        `;
        this.contentArea().innerHTML = html;
        const container = document.getElementById('chatContainer');
        if(container) container.scrollTop = container.scrollHeight;
    },

    renderSentencesPage: function() {
        let html = `<h2>⭐ 필수 문장 모음</h2>`;
        for (const date in studyData.logs) {
            (studyData.logs[date].sentences || []).forEach(s => {
                html += `
                    <div class="sentence-item-card all-view">
                        <div class="s-content"><strong>${s.text}</strong><p>${s.trans}</p></div>
                        <button class="speak-btn-all" data-text="${encodeURIComponent(s.text)}" onclick="App.speak(decodeURIComponent(this.dataset.text))">🔊 발음 듣기</button>
                    </div>`;
            });
        }
        this.contentArea().innerHTML = html;
    },

    renderWordsPage: function() {
        const words = studyData.words || [];
        let html = `<h2>📖 나의 단어장</h2><div class="input-section"><h3>🆕 새 단어 등록</h3><input type="text" id="wordIn" placeholder="영어 단어"><label style="font-size: 12px; color: #888; margin-bottom: 5px; display: block;">뜻</label><textarea id="wordMeanIn" class="double-height" placeholder="단어의 뜻을 입력하세요"></textarea><label style="font-size: 12px; color: #888; margin-bottom: 5px; display: block;">설명 (예문 등)</label><textarea id="wordDescIn" class="double-height" placeholder="예문이나 추가 설명을 입력하세요"></textarea> <button class="brown-btn" style="width:100%; margin-top: 10px;" onclick="App.addWord()">단어장에 추가</button></div><div id="wordList">${words.map((w, i) => `<div class="sentence-item-card word-card"><div class="s-content"><strong class="word-title">${w.word}</strong><p class="word-mean">${w.mean}</p><div class="word-desc">${w.desc}</div></div><div class="s-actions word-btns"><button class="white-btn" data-text="${encodeURIComponent(w.word)}" onclick="App.speak(decodeURIComponent(this.dataset.text))">🔊 발음</button><button class="del-x-btn" onclick="App.deleteWord(${i})">❌ 삭제</button></div></div>`).join('')}</div>`;
        this.contentArea().innerHTML = html;
    },

    renderTestPage: function(sentenceObj) {
        let html = `<div class="test-container"><h2>🎲 랜덤 문장 테스트</h2><div class="test-card"><p>이 문장은 무슨 뜻일까요?</p><h3>${sentenceObj.text}</h3><button class="test-speak-btn" data-text="${encodeURIComponent(sentenceObj.text)}" onclick="App.speak(decodeURIComponent(this.dataset.text))">🔊 발음 듣기</button><div class="test-answer-area"><input type="text" id="testInput" placeholder="뜻을 입력하세요" onkeypress="if(event.keyCode==13) App.checkAnswer()"><button class="brown-btn" onclick="App.checkAnswer()">정답 확인</button></div><div id=\"testResult\"></div><button class=\"white-btn next-test-btn\" onclick=\"App.startRandomTest()\">다음 문제 ➡️</button></div></div>`;
        this.contentArea().innerHTML = html;
    },

    renderWordTestPage: function(wordObj) {
        let html = `<div class="test-container"><h2>📖 나의 단어 테스트</h2><div class="test-card"><p>이 뜻을 가진 <strong>영어 단어</strong>는 무엇일까요?</p><h3 style="color: #8b5a2b; margin: 20px 0; white-space: pre-wrap;">${wordObj.mean}</h3><div class="test-answer-area"><input type="text" id="wordTestInput" placeholder="영어 단어를 입력하세요" onkeypress="if(event.keyCode==13) App.checkWordAnswer()"><button class="brown-btn" onclick="App.checkWordAnswer()">정답 확인</button></div><div id="wordTestResult"></div><button class="white-btn next-test-btn" onclick="App.startWordTest()">다음 문제 ➡️</button></div></div>`;
        this.contentArea().innerHTML = html;
    }
};
