// app.js
console.log("app.js 已載入");

window.onerror = function(msg, url, line) {
  alert("JS錯誤: " + msg + " (行 " + line + ")");
  return false;
};

let currentUser = null;
let userData = null;

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
    errorEl.textContent = "請填