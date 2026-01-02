// Firebase 콘솔 -> 프로젝트 설정에서 복사한 본인의 정보를 넣으세요
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "tjdgns-2e002.firebaseapp.com",
    databaseURL: "https://tjdgns-2e002-default-rtdb.firebaseio.com",
    projectId: "tjdgns-2e002",
    storageBucket: "tjdgns-2e002.appspot.com",
    messagingSenderId: "YOUR_ID",
    appId: "YOUR_APP_ID"
};

// 초기화
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
