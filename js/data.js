const firebaseConfig = {
    apiKey: "AIzaSyDFsKzHtjw9Hc-tPQGs4gnDpqq6VzmpZ3I",
    authDomain: "tjdgns-2e002.firebaseapp.com",
    databaseURL: "https://tjdgns-2e002-default-rtdb.firebaseio.com",
    projectId: "tjdgns-2e002",
    storageBucket: "tjdgns-2e002.firebasestorage.app",
    messagingSenderId: "406888986104",
    appId: "1:406888986104:web:a1d65601324971c3c0d20d",
    measurementId: "G-DB42KPYH0B"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let studyData = {
    logs: {
        "260101": { chats: [], sentences: [] }
    }
};

// 데이터 로드: DB의 값이 바뀔 때마다 실행되어 UI를 동기화함
function loadData(callback) {
    db.ref('studyHubData').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            studyData = data;
        }
        if (callback) callback();
    });
}

// 데이터 저장: DB에 현재 studyData 상태를 저장
function saveToStorage() {
    db.ref('studyHubData').set(studyData)
        .then(() => console.log("Cloud Saved"))
        .catch(err => console.error("Save Error:", err));
}