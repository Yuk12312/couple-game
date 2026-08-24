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

// 註冊（加強除錯版）
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
    alert("1. 開始註冊...");

    const cred = await auth.createUserWithEmailAndPassword(email, password);
    
    alert("2. Auth 成功，開始寫入資料...");

    const code = generateCode();
    await db.collection("users").doc(cred.user.uid).set({
      email: email,
      points: 50,
      pairCode: code,
      partnerId: null,
      createdAt: new Date()
    });

    alert("3. 用戶資料寫入成功...");

    await db.collection("codes").doc(code).set({
      uid: cred.user.uid
    });

    alert("4. 註冊完成！");

  } catch (err) {
    errorEl.textContent = "錯誤: " + err.message;
    alert("錯誤發生: " + err.message);
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
  return Math