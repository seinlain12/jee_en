const savedData = localStorage.getItem('studyHubData');

let studyData = savedData ? JSON.parse(savedData) : {
    logs: {
        "260101": {
            chats: [],
            sentences: []
        }
    }
};

function saveToStorage() {
    localStorage.setItem('studyHubData', JSON.stringify(studyData));
}
