// 1. 로컬 스토리지에서 데이터를 가져옵니다.
const savedData = localStorage.getItem('studyHubData');

// 2. 데이터가 있으면 가져오고, 없으면 기본 구조를 만듭니다.
let studyData = savedData ? JSON.parse(savedData) : {
    logs: {
        "260101": {
            chats: [
                { role: "gemini", text: "반가워요! 오늘 공부를 시작해볼까요?\n엔터를 눌러 여러 줄을 입력해도 잘 저장됩니다." }
            ],
            sentences: [
                { text: "K looks like a model.", trans: "K는 모델처럼 보여요." }
            ]
        }
    }
};

// 3. 데이터를 로컬 스토리지에 저장하는 함수입니다.
// App.js에서 추가/삭제가 일어날 때마다 이 함수를 호출합니다.
function saveToStorage() {
    localStorage.setItem('studyHubData', JSON.stringify(studyData));
}
