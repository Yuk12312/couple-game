// app.js

let currentUser = null;
let userData = null;

// 監聽登入狀態
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    await loadUserData();
  } else {
    showScreen("auth-screen");
  }
});

// 顯示指定畫面
function showScreen(id) {
  document.getElementById("auth-screen").classList.add("hidden");
  document.getElementById("pair-screen").classList.add("hidden");
  document.getElementById("home-screen").classList.add("hidden");
  document.getElementById(id).classList.remove("hidden");
}

// 註冊
async function register() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("auth-error");
  errorEl.textContent = "";

  if (!email || !password) {
    errorEl.textContent = "請填寫 Email 同密碼";
    return;
  }

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    
    // 建立用戶資料
    const code = generateCode();
    await db.collection("users").doc(cred.user.uid).set({
      email: email,
      points: 50,
      pairCode: code,
      partnerId: null,
      createdAt: new Date()
    });

    // 同時把配對碼寫入 codes 集合方便查詢
    await db.collection("codes").doc(code).set({
      uid: cred.user.uid
    });

  } catch (err) {
    errorEl.textContent = err.message;
  }
}

// 登入
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("auth-error");
  errorEl.textContent = "";

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    errorEl.textContent = "登入失敗，請檢查 Email 或密碼";
  }
}

// 登出
function logout() {
  auth.signOut();
}

// 產生 6 位配對碼
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 載入用戶資料
async function loadUserData() {
  const doc = await db.collection("users").doc(currentUser.uid).get();
  if (!doc.exists) return;

  userData = doc.data();

  if (userData.partnerId) {
    // 已配對 → 顯示主畫面
    showScreen("home-screen");
    document.getElementById("my-points").textContent = userData.points;
    
    // 取得對方資料
    const partnerDoc = await db.collection("users").doc(userData.partnerId).get();
    if (partnerDoc.exists) {
      document.getElementById("partner-name").textContent = partnerDoc.data().email.split("@")[0];
    }
  } else {
    // 未配對 → 顯示配對畫面
    showScreen("pair-screen");
    document.getElementById("my-code").textContent = userData.pairCode;
  }
}

// 用配對碼配對
async function pairWithCode() {
  const code = document.getElementById("partner-code").value.trim();
  const errorEl = document.getElementById("pair-error");
  const successEl = document.getElementById("pair-success");
  errorEl.textContent = "";
  successEl.textContent = "";

  if (code.length !== 6) {
    errorEl.textContent = "請輸入 6 位配對碼";
    return;
  }

  if (code === userData.pairCode) {
    errorEl.textContent = "唔可以輸入自己的配對碼";
    return;
  }

  try {
    const codeDoc = await db.collection("codes").doc(code).get();
    if (!codeDoc.exists) {
      errorEl.textContent = "配對碼不存在";
      return;
    }

    const partnerId = codeDoc.data().uid;

    // 雙方互相綁定
    await db.collection("users").doc(currentUser.uid).update({
      partnerId: partnerId
    });
    await db.collection("users").doc(partnerId).update({
      partnerId: currentUser.uid
    });

    successEl.textContent = "配對成功！";
    setTimeout(() => loadUserData(), 1000);

  } catch (err) {
    errorEl.textContent = "配對失敗：" + err.message;
  }
}

// 送點數給對方
async function sendPoints() {
  const amount = parseInt(document.getElementById("send-amount").value);
  const msgEl = document.getElementById("home-message");
  msgEl.textContent = "";

  if (!amount || amount <= 0) {
    msgEl.textContent = "請輸入正確點數";
    msgEl.className = "error";
    return;
  }

  if (userData.points < amount) {
    msgEl.textContent = "點數不足";
    msgEl.className = "error";
    return;
  }

  try {
    // 扣除自己點數
    await db.collection("users").doc(currentUser.uid).update({
      points: firebase.firestore.FieldValue.increment(-amount)
    });

    // 增加對方點數
    await db.collection("users").doc(userData.partnerId).update({
      points: firebase.firestore.FieldValue.increment(amount)
    });

    msgEl.textContent = `成功送出 ${amount} 點！`;
    msgEl.className = "success";
    document.getElementById("send-amount").value = "";

    // 重新載入
    await loadUserData();

  } catch (err) {
    msgEl.textContent = "送出失敗：" + err.message;
    msgEl.className = "error";
  }
}