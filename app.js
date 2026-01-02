const App = {
    init: function() {
        this.bindMenu();
        UI.renderLogs();
    },

    bindMenu: function() {
        document.getElementById('menuBtn').onclick = () => document.getElementById('sidebar').classList.toggle('active');
        document.querySelectorAll('.sidebar li').forEach(item => {
            item.onclick = () => {
                const view = item.getAttribute('data-view');
                if (view === 'dates') UI.renderLogs();
                else if (view === 'sentences') UI.renderSentencesPage();
                document.getElementById('sidebar').classList.remove('active');
            };
        });
    },

    addChat: function(date) {
        const gIn = document.getElementById('geminiIn');
        const mIn = document.getElementById('meIn');
        if (gIn.value.trim()) studyData.logs[date].chats.push({ role: "gemini", text: gIn.value });
        if (mIn.value.trim()) studyData.logs[date].chats.push({ role: "me", text: mIn.value });
        gIn.value = ""; mIn.value = "";
        saveToStorage();
        UI.renderLogDetail(date);
    },

    // 핵심 수정: 긴 문장 전체 번역 로직
    addSentence: async function(date) {
        const sIn = document.getElementById('sentenceIn');
        const text = sIn.value.trim();
        if (!text) return;

        try {
            // 문장 내 특수문자 및 공백을 안전하게 처리하기 위해 encodeURIComponent 사용
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`);
            const data = await res.json();
            
            // 핵심 수정 포인트: data[0]에 있는 모든 문장 조각들을 합칩니다.
            let fullTranslation = "";
            if (data[0]) {
                fullTranslation = data[0]
                    .map(item => item[0]) // 각 조각의 첫 번째 요소(번역문)만 추출
                    .filter(translatedPart => translatedPart !== null) // null 값 방지
                    .join(""); // 모두 하나로 합침
            }

            studyData.logs[date].sentences.push({
                text: text,
                trans: fullTranslation || "번역 결과가 없습니다."
            });
            
            sIn.value = "";
            saveToStorage();
            UI.renderLogDetail(date);
        } catch (e) {
            console.error("번역 오류:", e);
            const manualTrans = prompt("번역 중 오류가 발생했습니다. 직접 뜻을 입력해주세요:", "");
            studyData.logs[date].sentences.push({ text: text, trans: manualTrans || "뜻 없음" });
            saveToStorage();
            UI.renderLogDetail(date);
        }
    },

    delSentence: function(date, index) {
        studyData.logs[date].sentences.splice(index, 1);
        saveToStorage();
        UI.renderLogDetail(date);
    },

    speak: function(text) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';
        utter.rate = 0.9;
        window.speechSynthesis.speak(utter);
    },

    askNewDate: function() {
        const date = prompt("날짜 입력 (예: 260102)");
        if (date && !studyData.logs[date]) {
            studyData.logs[date] = { chats: [], sentences: [] };
            saveToStorage();
            UI.renderLogs();
        }
    },

    deleteFullDate: function(date) {
        if (confirm("이 날짜의 모든 데이터를 삭제하시겠습니까?")) {
            delete studyData.logs[date];
            saveToStorage();
            UI.renderLogs();
        }
    },

    saveData: function() { alert("데이터가 안전하게 저장되었습니다."); }
};

document.addEventListener('DOMContentLoaded', () => App.init());