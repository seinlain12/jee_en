// 전역 데이터 객체 (초기값)
let studyData = { logs: {} };

const App = {
    currentTestSentence: null,

    // [수정] 앱 초기화 시 서버에서 데이터를 먼저 가져옴
    init: async function() {
        this.bindMenu();
        
        // Firebase에서 데이터 로드 (DataManager는 data.js에 정의됨)
        const serverData = await DataManager.loadAllData();
        // 서버에 데이터가 있으면 적용, 없으면 기본값 유지
        studyData.logs = serverData.records || {}; 
        
        console.log("온라인 데이터 로드 완료");
        UI.renderLogs();
    },

    bindMenu: function() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay') || document.createElement('div');
        if (!document.getElementById('overlay')) {
            overlay.id = 'overlay'; overlay.className = 'overlay';
            document.body.appendChild(overlay);
        }

        document.getElementById('menuBtn').onclick = () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        };

        overlay.onclick = () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        };

        document.querySelectorAll('.sidebar li').forEach(item => {
            item.onclick = () => {
                const view = item.getAttribute('data-view');
                if (view === 'dates') UI.renderLogs();
                else if (view === 'sentences') UI.renderSentencesPage();
                else if (view === 'test') App.startRandomTest();
                else if (view === 'gemini') window.open("https://gemini.google.com/app", "_blank");
                
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            };
        });
    },

    // [수정] 데이터 변경 시마다 Firebase에 자동 저장
    saveToFirebase: async function() {
        await DataManager.saveRecords(studyData.logs);
        console.log("서버 백업 완료");
    },

    addChat: function(date) {
        const gIn = document.getElementById('geminiIn');
        const mIn = document.getElementById('meIn');
        if (gIn.value.trim()) studyData.logs[date].chats.push({ role: "gemini", text: gIn.value });
        if (mIn.value.trim()) studyData.logs[date].chats.push({ role: "me", text: mIn.value });
        gIn.value = ""; mIn.value = ""; 
        
        this.saveToFirebase(); // 서버 저장
        UI.renderLogDetail(date);
    },

    addSentence: async function(date) {
        const sIn = document.getElementById('sentenceIn');
        const text = sIn.value.trim();
        if (!text) return;
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`);
            const data = await res.json();
            const trans = data[0] ? data[0].map(i => i[0]).join("") : "";
            studyData.logs[date].sentences.push({ text, trans });
            sIn.value = "";
            
            this.saveToFirebase(); // 서버 저장
            UI.renderLogDetail(date);
        } catch (e) { alert("번역 실패"); }
    },

    delSentence: function(date, index) {
        if (confirm("이 문장을 삭제할까요?")) {
            studyData.logs[date].sentences.splice(index, 1);
            this.saveToFirebase(); // 서버 저장
            UI.renderLogDetail(date);
        }
    },

    deleteFullDate: function(date) {
        if (confirm(`${date}의 모든 기록을 삭제하시겠습니까?`)) {
            delete studyData.logs[date];
            this.saveToFirebase(); // 서버 저장
            UI.renderLogs();
        }
    },

    checkAnswer: function() {
        const input = document.getElementById('testInput').value.trim();
        const correct = this.currentTestSentence.trans;
        const resDiv = document.getElementById('testResult');
        const isCorrect = correct.replace(/\s/g, "").includes(input.replace(/\s/g, ""));
        resDiv.innerHTML = isCorrect ? `<p style="color:green; margin-top:10px;">⭕ 정답입니다! (${correct})</p>` 
                                     : `<p style="color:red; margin-top:10px;">❌ 다시 생각해보세요. (기준: ${correct})</p>`;
    },

    startRandomTest: function() {
        let all = [];
        for (const d in studyData.logs) all = all.concat(studyData.logs[d].sentences);
        if (all.length === 0) return alert("문장이 없습니다.");
        this.currentTestSentence = all[Math.floor(Math.random() * all.length)];
        UI.renderTestPage(this.currentTestSentence);
    },

    speak: (t) => {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(t); u.lang = 'en-US';
        window.speechSynthesis.speak(u);
    },

    askNewDate: function() {
        const d = prompt("날짜 입력 (YYMMDD)");
        if (d && !studyData.logs[d]) { 
            studyData.logs[d] = { chats: [], sentences: [] }; 
            this.saveToFirebase(); // 서버 저장
            UI.renderLogs(); 
        }
    }
};

// 앱 초기화 실행
document.addEventListener('DOMContentLoaded', () => App.init());
