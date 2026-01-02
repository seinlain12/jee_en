const App = {
    currentTestSentence: null,
    currentTestWord: null, // 현재 테스트 중인 단어 저장
    geminiUrl: "https://gemini.google.com/u/3/app/c817dbe3e5aa5be3?hl=ko&pageId=none",

    init: function() {
        const password = prompt("비밀번호를 입력하세요.");
        if (password === "970808") {
            document.body.style.display = "flex";
            this.bindMenu();
            loadData(() => {
                UI.renderLogs();
            });
        } else {
            alert("비밀번호가 틀렸습니다.");
            window.location.reload();
        }
    },

    bindMenu: function() {
        document.getElementById('menuBtn').onclick = () => document.getElementById('sidebar').classList.toggle('active');
        document.querySelectorAll('.sidebar li').forEach(item => {
            item.onclick = () => {
                const view = item.getAttribute('data-view');
                if (view === 'dates') UI.renderLogs();
                else if (view === 'sentences') UI.renderSentencesPage();
                else if (view === 'words') UI.renderWordsPage();
                else if (view === 'test') App.startRandomTest();
                else if (view === 'wordTest') App.startWordTest(); // 단어 테스트 시작
                else if (view === 'gemini') window.open(this.geminiUrl, '_blank');
                document.getElementById('sidebar').classList.remove('active');
            };
        });
    },

    addWord: function() {
        const wordIn = document.getElementById('wordIn');
        const meanIn = document.getElementById('wordMeanIn');
        const descIn = document.getElementById('wordDescIn');
        if (!wordIn.value.trim() || !meanIn.value.trim()) return alert("단어와 뜻을 입력하세요.");
        if (!studyData.words) studyData.words = [];
        studyData.words.push({
            word: wordIn.value.trim(),
            mean: meanIn.value.trim(),
            desc: descIn.value.trim()
        });
        saveToStorage().then(() => UI.renderWordsPage());
    },

    deleteWord: function(index) {
        if (confirm("이 단어를 삭제할까요?")) {
            studyData.words.splice(index, 1);
            saveToStorage().then(() => UI.renderWordsPage());
        }
    },

    // 📖 단어 테스트 시작
    startWordTest: function() {
        const words = studyData.words || [];
        if (words.length === 0) return alert("단어장에 등록된 단어가 없습니다.");
        this.currentTestWord = words[Math.floor(Math.random() * words.length)];
        UI.renderWordTestPage(this.currentTestWord);
    },

    // 📖 단어 테스트 정답 확인
    checkWordAnswer: function() {
        const userInput = document.getElementById('wordTestInput').value.trim().toLowerCase();
        if (!userInput) return;
        const correct = this.currentTestWord.word.toLowerCase();
        const resDiv = document.getElementById('wordTestResult');
        
        if (userInput === correct) {
            resDiv.innerHTML = `<div class="res correct" style="color:green; font-weight:bold; margin-top:10px;">⭕ 정답입니다!</div>`;
            App.speak(correct); // 정답 시 발음 들려주기
        } else {
            resDiv.innerHTML = `<div class="res wrong" style="color:red; font-weight:bold; margin-top:10px;">❌ 틀렸습니다. 정답은 [ ${correct} ] 입니다.</div>`;
        }
    },

    addChat: function(date) {
        const gIn = document.getElementById('geminiIn');
        const mIn = document.getElementById('meIn');
        if (!studyData.logs[date]) studyData.logs[date] = { chats: [], sentences: [] };
        if (!studyData.logs[date].chats) studyData.logs[date].chats = [];
        const gVal = gIn.value.trim();
        const mVal = mIn.value.trim();
        if (gVal) studyData.logs[date].chats.push({ role: "gemini", text: gVal });
        if (mVal) studyData.logs[date].chats.push({ role: "me", text: mVal });
        if (gVal || mVal) {
            gIn.value = ""; mIn.value = "";
            saveToStorage().then(() => UI.renderLogDetail(date));
        }
    },

    addSentence: async function(date) {
        const sIn = document.getElementById('sentenceIn');
        const text = sIn.value.trim();
        if (!text) return;
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`);
            const data = await res.json();
            let trans = data[0] ? data[0].map(item => item[0]).join("") : "";
            if (!studyData.logs[date].sentences) studyData.logs[date].sentences = [];
            studyData.logs[date].sentences.push({ text: text, trans: trans });
            sIn.value = "";
            saveToStorage().then(() => UI.renderLogDetail(date));
        } catch (e) { alert("번역 실패"); }
    },

    deleteFullDate: function(date) {
        if (confirm(`${date} 기록을 삭제할까요?`)) {
            if (studyData.logs && studyData.logs[date]) {
                delete studyData.logs[date];
                db.ref('studyHubData').set(studyData)
                    .then(() => {
                        alert("삭제되었습니다.");
                        UI.renderLogs();
                    })
                    .catch(err => alert("삭제 실패: " + err));
            }
        }
    },

    checkAnswer: function() {
        const userInput = document.getElementById('testInput').value.trim();
        if (!userInput) return;
        const correct = this.currentTestSentence.trans;
        const u = userInput.replace(/[\s\.\?\!]/g, "");
        const c = correct.replace(/[\s\.\?\!]/g, "");
        const isOk = c.includes(u) || u.includes(c);
        const resDiv = document.getElementById('testResult');
        if (isOk) {
            resDiv.innerHTML = `<div class="res correct" style="color:green; font-weight:bold; margin-top:10px;">⭕ 정답입니다!<br><small style="color:#666;">기준 답안: ${correct}</small></div>`;
        } else {
            resDiv.innerHTML = `
                <div class="res wrong" style="color:red; font-weight:bold; margin-top:10px;">❌ 조금 다르네요.<br><small style="color:#666;">기준 답안: ${correct}</small></div>
                <button class="white-btn" style="width:100%; margin-top:10px; font-size:12px;" onclick="App.forceCorrect()">의미는 맞아요! 정답 처리</button>
            `;
        }
    },

    forceCorrect: function() {
        const resDiv = document.getElementById('testResult');
        resDiv.innerHTML = `<div class="res correct" style="color:green; font-weight:bold; margin-top:10px;">⭕ 뉘앙스 확인! 정답 처리되었습니다.</div>`;
    },

    startRandomTest: function() {
        let all = [];
        for (const d in studyData.logs) {
            if (studyData.logs[d].sentences) all = all.concat(studyData.logs[d].sentences);
        }
        if (all.length === 0) return alert("문장이 없습니다.");
        this.currentTestSentence = all[Math.floor(Math.random() * all.length)];
        UI.renderTestPage(this.currentTestSentence);
    },

    speak: function(text) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';
        window.speechSynthesis.speak(utter);
    },

    askNewDate: function() {
        const d = prompt("날짜 입력 (YYMMDD)");
        if (d) {
            if (!studyData.logs) studyData.logs = {};
            if (!studyData.logs[d]) {
                studyData.logs[d] = { chats: [], sentences: [] };
                saveToStorage().then(() => UI.renderLogs());
            }
        }
    },

    delSentence: function(date, i) {
        studyData.logs[date].sentences.splice(i, 1);
        saveToStorage().then(() => UI.renderLogDetail(date));
    },

    saveData: function() {
        saveToStorage().then(() => alert("클라우드 저장 완료!"));
    }
};
document.addEventListener('DOMContentLoaded', () => App.init());
