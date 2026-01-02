const DataManager = {
    // 서버에서 데이터 가져오기
    async getData(path) {
        try {
            const snapshot = await db.ref(path).once('value');
            return snapshot.val() || [];
        } catch (e) {
            console.error("데이터 불러오기 실패:", e);
            return [];
        }
    },

    // 서버에 데이터 저장하기
    async saveData(path, data) {
        try {
            await db.ref(path).set(data);
            console.log("자동 백업 완료");
        } catch (e) {
            console.error("백업 실패:", e);
        }
    }
};
