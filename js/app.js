const App = {
    currentTestSentence: null,
    geminiUrl: "https://gemini.google.com/u/2/app/655389b059f1115e?hl=ko&pageId=none",

    init: function() {
        // 🔒 비밀번호 인증 (970808)
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
                else if (view === 'test') App.startRandomTest();
                else if (view === 'gemini') window.open(this.geminiUrl, '_blank');
                document.getElementById('sidebar').classList.remove('active');
            };
        });
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

    // 🗑️ 날짜 삭제 오류 수정
    deleteFullDate: function(date) {
        if (confirm(`${date} 기록을 삭제할까요?`)) {
            // 1. 로컬 데이터에서 해당 날짜 제거
            if (studyData.logs && studyData.logs[date]) {
                delete studyData.logs[date];
                
                // 2. Firebase 서버에 변경된 전체 데이터를 다시 저장 (강제 동기화)
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
        resDiv.innerHTML = isOk ? `<div class="res correct">⭕ 정답입니다!</div>` : `<div class="res wrong">❌ 정답: ${correct}</div>`;
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
