// Google Apps Script 部署後的網址(資料庫)
const sheetURL = "https://script.google.com/macros/s/AKfycbyqSRnKxN-cEnhUu6BFeZ9KR49q3KLwWvpowLTLvA8Ok0ZquByxAK_KC8yM3bdr6Zkm/exec";

let faqList = [];

// 讀取 FAQ JSON 資料（在頁面載入時就執行）
fetch(sheetURL)
  .then(res => res.json())
  .then(data => {
    faqList = data;
    console.log("FAQ 載入成功，共有", faqList.length, "筆資料");
  })
  .catch(error => {
    console.error("無法載入 FAQ 資料：", error);
  });
  //  對輸入的關鍵字進行回應
function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  appendMessage("你", message, "user");

  const reply = getReply(message);
  appendMessage("社團運作小幫手", reply, "bot");
  input.value = "";
}
function getReply(message) {
  const replies = new Set();
  // 🧹 對輸入進行「標準化」處理（小寫、移除空格與標點）
  const cleanMsg = message
    .toLowerCase()
    .replace(/\s+/g, "")             // 去空格
    .replace(/[！？!?,，。.\-]/g, "") // 去標點

  for (let item of faqList) {
    const keywords = Array.isArray(item.keywords)
      ? item.keywords
      : item.keywords.split(",").map(k => k.trim());

    for (let keyword of keywords) {
      const cleanKeyword = keyword.toLowerCase().replace(/\s+/g, "");

      if (cleanMsg.includes(cleanKeyword)) {
        replies.add(item.answer);
        break;
      }
    }
  }
  if (replies.size > 0) {
    return Array.from(replies).join("\n\n---\n\n");
  }

  return "抱歉，我找不到這個問題的答案。請輸入：場地、器材、活動申請等關鍵字";
}

function appendMessage(sender, text, type) {
  const chatBox = document.getElementById("chat-box");
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", type);

  // 網址變超連結
  let parsedText = text.replace(/(https?:\/\/[^\s]+)/g, function(url) {
    return `<a href="${url}" target="_blank" style="color:blue;">${url}</a>`;
  }).replace(/\n/g, "<br>");

  // 時間
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  msgDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
      <div><strong>${sender}：</strong> ${parsedText}</div>
      <div style="font-size: 0.75em; color: gray; margin-left: 10px;">${time}</div>
    </div>`;

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  
}

// Enter直接輸入
window.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("user-input");
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
});
