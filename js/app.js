const App = {
    currentTestSentence: null,
    geminiUrl: "https://gemini.google.com/u/2/app/655389b059f1115e?hl=ko&pageId=none",

    init: function() {
        console.log("App Initialized");
        this.bindEvents();
        UI.renderLogs(); // 첫 화면 로드
    },

    bindEvents: function() {
        const menuBtn = document.getElementById('menuBtn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');

        // 사이드바 토글 함수
        const toggleMenu = () => {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                sidebar.classList.toggle('active');
                overlay.classList.toggle('active');
            } else {
                sidebar.classList.toggle('hidden');
            }
        };

        menuBtn.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);

        // 메뉴 아이템 클릭 이벤트
        document.querySelectorAll('.sidebar li').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.getAttribute('data-view');
                
                if (view === 'dates') UI.renderLogs();
                else if (view === 'sentences') UI.renderSentencesPage();
                else if (view === 'test') App.startRandomTest();
                else if (view === 'gemini') window.open(this.geminiUrl, '_blank');
                
                // 클릭 후 메뉴 닫기 (모바일전용)
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                }
            });
        });
    },

    // --- 나머지 비즈니스 로직 (기존과 동일) ---
    addSentence: async function(date) {
        const sIn = document.getElementById('sentenceIn');
        const text = sIn.value.trim();
        if (!text) return;
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`);
            const data = await res.json();
            let trans = data[0] ? data[0].map(item => item[0]).join("") : "";
            studyData.logs[date].sentences.push({ text, trans });
            sIn.value = "";
            saveToStorage();
            UI.renderLogDetail(date);
        } catch (e) { alert("번역 실패"); }
    },

    startRandomTest: function() {
        let all = [];
        for (const date in studyData.logs) all = all.concat(studyData.logs[date].sentences);
        if (all.length === 0) return alert("문장이 없습니다.");
        this.currentTestSentence = all[Math.floor(Math.random() * all.length)];
        UI.renderTestPage(this.currentTestSentence);
    },

    checkAnswer: function() {
        const userInput = document.getElementById('testInput').value.trim();
        const correct = this.currentTestSentence.trans;
        const resultDiv = document.getElementById('testResult');
        
        // 간단한 텍스트 비교 로직
        const clean = (t) => t.replace(/[\s\.\?\!]/g, "");
        if (clean(userInput).includes(clean(correct)) || clean(correct).includes(clean(userInput))) {
            resultDiv.innerHTML = `<div class="res correct" style="color:green; margin:10px 0;">⭕ 정답! (기준: ${correct})</div>`;
        } else {
            resultDiv.innerHTML = `<div class="res wrong" style="color:red; margin:10px 0;">❌ 오답 (기준: ${correct})</div>`;
        }
    },

    addChat: function(date) {
        const gIn = document.getElementById('geminiIn'); 
        const mIn = document.getElementById('meIn');
        if (gIn.value.trim()) studyData.logs[date].chats.push({ role: "gemini", text: gIn.value });
        if (mIn.value.trim()) studyData.logs[date].chats.push({ role: "me", text: mIn.value });
        gIn.value = ""; mIn.value = ""; saveToStorage(); UI.renderLogDetail(date);
    },

    speak: function(text) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';
        window.speechSynthesis.speak(utter);
    },

    askNewDate: function() {
        const d = prompt("날짜 입력 (YYMMDD)");
        if (d && !studyData.logs[d]) { 
            studyData.logs[d] = { chats: [], sentences: [] }; 
            saveToStorage(); 
            UI.renderLogs(); 
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
