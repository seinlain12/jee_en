// 로컬 스토리지에서 기존 데이터를 불러옵니다.
const savedData = localStorage.getItem('studyHubData');

// 데이터가 있으면 파싱해서 사용하고, 없으면 초기 구조를 생성합니다.
// 2026년 날짜 형식에 맞춰 초기값을 설정했습니다.
let studyData = savedData ? JSON.parse(savedData) : {
    logs: {
        "260101": {
            chats: [],
            sentences: [
                { text: "K looks like a model. He has long legs.", trans: "K는 모델처럼 보여요. 그는 다리가 길거든요." }
            ]
        }
    }
};

/**
 * 변경된 데이터를 로컬 스토리지에 즉시 저장하는 함수입니다.
 * UI나 App 로직에서 데이터를 수정한 후 반드시 호출해야 합니다.
 */
function saveToStorage() {
    try {
        localStorage.setItem('studyHubData', JSON.stringify(studyData));
        console.log("Data saved successfully.");
    } catch (e) {
        console.error("Failed to save data to localStorage:", e);
    }
}
