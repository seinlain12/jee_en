const UI = {
    contentArea: () => document.getElementById('content'),

    shuffleArray: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    // 🎤 발음 테스트 UI 추가 (기존 기능 방해 금지)
    renderSpeakingTestPage: function(data) {
        let html = `
            <div class="test-container speak-test">
                <h2>🎤 듣고 바로 말하기</h2>
                <div class="test-card" style="text-align:center;">
                    <div class="hint-box" style="background:#f2f2f2; padding:30px; border-radius:20px; margin-bottom:20px;">
                        <p style="color:#888; margin-bottom:10px;">상황 힌트</p>
                        <h3 style="font-size:20px; margin-bottom:15px;">${data.trans}</h3>
                        <p style="color:var(--main-brown); font-weight:bold;">키워드: ${data.keywords.filter(k=>k).join(', ')}</p>
                    </div>
                    <div id="hiddenSentence" style="display:none; margin-bottom:20px; padding:15px; border:1px dashed var(--main-brown); border-radius:10px; background:#fffbe6; font-weight:bold; color:#333;">${data.text}</div>
                    <div class="btn-group" style="display:flex; gap:10px;">
                        <button class="brown-btn" style="flex:1;" onclick="App.speak('${data.text.replace(/'/g, "\\'")}')">🔊 듣기</button>
                        <button id="micBtn" class="white-btn" style="flex:1; border:2px solid var(--main-brown);" onclick="App.startListening()">🎤 말하기</button>
                    </div>
                    <div id="speakResult" style="margin-top:25px; min-height:80px;"></div>
                    <button class="white-btn" style="width:100%; margin-top:20px; font-size:14px; color:#666;" onclick="UI.toggleHiddenSentence()">👁️ 문장 전체보기</button>
                    <button class="white-btn" style="width:100%; margin-top:10px; font-weight:bold;" onclick="App.startSpeakingTest()">다음 문장 ➡️</button>
                </div>
            </div>
        `;
        this.contentArea().innerHTML = html;
    },

    toggleHiddenSentence: function() {
        const div = document.getElementById('hiddenSentence');
        if (div) div.style.display = (div.style.display === 'none') ? 'block' : 'none';
    },

    updateMicStatus: function(isListening) {
        const btn = document.getElementById('micBtn');
        if (btn) {
            btn.innerHTML = isListening ? "🔴 듣는 중..." : "🎤 말하기";
            btn.style.background = isListening ? "#fff0f0" : "#fff";
        }
    },

    renderSpeakingResult: function(isSuccess, speech) {
        const resDiv = document.getElementById('speakResult');
        const correctText = App.currentSpeakingTest.text;
        if (isSuccess) {
            resDiv.innerHTML = `<h2 style="color:green;">👍 잘했어요!</h2><p style="color:#333; font-weight:bold;">정답: ${correctText}</p><p style="color:#999; font-size:13px;">인식: ${speech}</p>`;
            App.speak("Great job!");
        } else {
            resDiv.innerHTML = `<h2 style="color:orange;">🔁 한 번 더 해볼까?</h2><p style="color:#333; font-weight:bold;">정답: ${correctText}</p><p style="color:#999; font-size:13px;">인식: ${speech}</p>`;
        }
    },

    // 📅 기존 공부 기록 UI (복구)
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
                        <button class="chat-speak-btn" data-text="${encodeURIComponent(chat.text)}" onclick="App.speak(decodeURIComponent(this.dataset.text))">🔊</button>
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
                            <div class="s-actions"><button data-text="${encodeURIComponent(s.text)}" onclick="App.speak(decodeURIComponent(this.dataset.text))">🔊</button><button class="del-x" onclick="App.delSentence('${date}', ${i})">❌</button></div>
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

    // ⭐ 필수 문장 페이지 (복구)
    renderSentencesPage: function() {
        let all = [];
        for (const date in studyData.logs) { (studyData.logs[date].sentences || []).forEach(s => all.push(s)); }
        const shuffled = this.shuffleArray([...all]);
        let html = `<h2>⭐ 필수 문장 모음 (랜덤)</h2><div id="autoPlayControl" style="margin-bottom:20px;"><button id="startPlayBtn" class="brown-btn" style="width:100%;" onclick="App.startAutoPlay()">🔀 전체 랜덤 재생 (3초 간격)</button><button id="stopPlayBtn" class="white-btn" style="width:100%; display:none; border-color:red; color:red;" onclick="App.stopAutoPlay()">⏹️ 재생 중지</button></div>`;
        shuffled.forEach(s => {
            html += `<div class="sentence-item-card all-view"><div class="s-content"><strong>${s.text}</strong><p>${s.trans}</p></div><button class="speak-btn-all" data-text="${encodeURIComponent(s.text)}" onclick="App.speak(decodeURIComponent(this.dataset.text))">🔊 발음 듣기</button></div>`;
        });
        this.contentArea().innerHTML = html;
    },

    updateAutoPlayUI: function(isPlaying) {
        const startBtn = document.getElementById('startPlayBtn'), stopBtn = document.getElementById('stopPlayBtn');
        if (startBtn && stopBtn) { startBtn.style.display = isPlaying ? 'none' : 'block'; stopBtn.style.display = isPlaying ? 'block' : 'none'; }
    },

    // 📖 나의 단어장 UI (복구: 뜻/설명 분리 및 스타일 원복)
    renderWordsPage: function() {
        const words = studyData.words || [];
        const shuffledWords = this.shuffleArray([...words]);
        let html = `
            <h2>📖 나의 단어장 (랜덤)</h2>
            <div class="input-section">
                <h3>🆕 새 단어 등록</h3>
                <input type="text" id="wordIn" placeholder="영어 단어">
                <label style="font-size: 12px; color: #888; margin-bottom: 5px; display: block;">뜻</label>
                <textarea id="wordMeanIn" class="double-height" placeholder="단어의 뜻을 입력하세요"></textarea>
                <label style="font-size: 12px; color: #888; margin-bottom: 5px; display: block;">설명 (예문 등)</label>
                <textarea id="wordDescIn" class="double-height" placeholder="예문이나 추가 설명을 입력하세요"></textarea> 
                <button class="brown-btn" style="width:100%; margin-top: 10px;" onclick="App.addWord()">단어장에 추가</button>
            </div>
            <div id="wordList">
                ${shuffledWords.map((w) => {
                    const originalIndex = words.indexOf(w);
                    return `
                    <div class="sentence-item-card word-card">
                        <div class="s-content"><strong class="word-title">${w.word}</strong><p class="word-mean">${w.mean}</p><div class="word-desc">${w.desc}</div></div>
                        <div class="s-actions word-btns"><button class="white-btn" data-text="${encodeURIComponent(w.word)}" onclick="App.speak(decodeURIComponent(this.dataset.text))">🔊 발음</button><button class="del-x-btn" onclick="App.deleteWord(${originalIndex})">❌ 삭제</button></div>
                    </div>`;
                }).join('')}
            </div>`;
        this.contentArea().innerHTML = html;
    },

    renderTestPage: function(sentenceObj) {
        let html = `<div class="test-container"><h2>🎲 랜덤 문장 테스트</h2><div class="test-card"><p>이 문장은 무슨 뜻일까요?</p><h3>${sentenceObj.text}</h3><button class="test-speak-btn" data-text="${encodeURIComponent(sentenceObj.text)}" onclick="App.speak(decodeURIComponent(this.dataset.text))">🔊 발음 듣기</button><div class="test-answer-area"><input type="text" id="testInput" placeholder="뜻을 입력하세요" onkeypress="if(event.keyCode==13) App.checkAnswer()"><button class="brown-btn" onclick="App.checkAnswer()">정답 확인</button></div><div id="testResult"></div><button class="white-btn next-test-btn" onclick="App.startRandomTest()">다음 문제 ➡️</button></div></div>`;
        this.contentArea().innerHTML = html;
    },

    renderWordTestPage: function(wordObj) {
        let html = `<div class="test-container"><h2>📖 나의 단어 테스트</h2><div class="test-card"><p>이 뜻을 가진 <strong>영어 단어</strong>는 무엇일까요?</p><h3 style="color: #8b5a2b; margin: 20px 0; white-space: pre-wrap;">${wordObj.mean}</h3><div class="test-answer-area"><input type="text" id="wordTestInput" placeholder="영어 단어를 입력하세요" onkeypress="if(event.keyCode==13) App.checkWordAnswer()"><button class="brown-btn" onclick="App.checkWordAnswer()">정답 확인</button></div><div id="wordTestResult"></div><button class="white-btn next-test-btn" onclick="App.startWordTest()">다음 문제 ➡️</button></div></div>`;
        this.contentArea().innerHTML = html;
    }
};
