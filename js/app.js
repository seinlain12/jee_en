const App = {
    currentTestSentence: null,
    geminiUrl: "https://gemini.google.com/u/2/app/655389b059f1115e?hl=ko&pageId=none",

    init: function() {
        this.bindMenu();
        // Firebase 데이터 로드 후 초기 화면 렌더링
        loadData(() => {
            UI.renderLogs();
        });
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

    addSentence: async function(date) {
        const sIn = document.getElementById('sentenceIn');
        const text = sIn.value.trim();
        if (!text) return;
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`);
            const data = await res.json();
            let fullTranslation = data[0] ? data[0].map(item => item[0]).join("") : "";
            if(!studyData.logs[date].sentences) studyData.logs[date].sentences = [];
            studyData.logs[date].sentences.push({ text: text, trans: fullTranslation });
            sIn.value = "";
            saveToStorage();
            UI.renderLogDetail(date);
        } catch (e) { alert("번역 실패"); }
    },

    addChat: function(date) {
        const gIn = document.getElementById('geminiIn'); const mIn = document.getElementById('meIn');
        if(!studyData.logs[date].chats) studyData.logs[date].chats = [];
        if (gIn.value.trim()) studyData.logs[date].chats.push({ role: "gemini", text: gIn.value });
        if (mIn.value.trim()) studyData.logs[date].chats.push({ role: "me", text: mIn.value });
        gIn.value = ""; mIn.value = ""; 
        saveToStorage(); 
        UI.renderLogDetail(date);
    },

    checkAnswer: function() {
        const userInput = document.getElementById('testInput').value.trim();
        if (!userInput) return;
        const correct = this.currentTestSentence.trans;
        const cleanUser = userInput.replace(/[\s\.\?\!]/g, "");
        const cleanCorrect = correct.replace(/[\s\.\?\!]/g, "");
        const isCorrect = cleanCorrect.includes(cleanUser) || cleanUser.includes(cleanCorrect);

        const resultDiv = document.getElementById('testResult');
        if (isCorrect) {
            resultDiv.innerHTML = `<div class="res correct">⭕ 정답입니다!</div>`;
        } else {
            resultDiv.innerHTML = `<div class="res wrong">❌ 정답: ${correct}</div>`;
        }
    },

    startRandomTest: function() {
        let all = [];
        for (const date in studyData.logs) {
            if(studyData.logs[date].sentences) all = all.concat(studyData.logs[date].sentences);
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
        if (d && (!studyData.logs || !studyData.logs[d])) { 
            if(!studyData.logs) studyData.logs = {};
            studyData.logs[d] = { chats: [], sentences: [] }; 
            saveToStorage(); 
            UI.renderLogs(); 
        }
    },

    delSentence: function(date, i) { 
        studyData.logs[date].sentences.splice(i, 1); 
        saveToStorage(); 
        UI.renderLogDetail(date); 
    },

    deleteFullDate: function(date) { 
        if (confirm("삭제할까요?")) { 
            delete studyData.logs[date]; 
            saveToStorage(); 
            UI.renderLogs(); 
        } 
    },

    saveData: function() { 
        saveToStorage();
        alert("클라우드 저장 완료!"); 
    }
};
document.addEventListener('DOMContentLoaded', () => App.init());