const savedData = localStorage.getItem('studyHubData');

let studyData = savedData ? JSON.parse(savedData) : {
    logs: {
        "260101": {
            chats: [
                { role: "gemini", text: "K looks like a model. He has long legs. That's why he is the center." },
                { role: "me", text: "케이는 모델 같아. 다리가 정말 길어. 그래서 센터인가봐." }
            ],
            sentences: []
        }
    }
};

function saveToStorage() {
    localStorage.setItem('studyHubData', JSON.stringify(studyData));
}