# ⚽ 足球數據分析追蹤器 (Soccer Stats Tracker)

一個從零開始開發、功能全面的免費足球比賽實時分析系統。

## 🚀 功能特色 (規劃中)

- **即時比分更新**: 使用 WebSocket 實現無刷新即時比分與數據推送。
- **深度比賽分析**: 展示射門、角球、控球率、傳球路線圖、熱力圖等詳細數據。
- **AI 預測與報告**: 基於歷史數據的比分預測與自動生成的戰術分析報告。
- **球隊與球員數據**: 完整的歷史戰績、陣容、個人數據與可視化對比。
- **用戶個人化**: 關注喜愛的球隊與聯賽，獲取個性化提醒。

## 🛠 技術栈 (Tech Stack)

- **前端**: Vue 3, ECharts
- **後端**: Node.js (Express), Socket.IO
- **數據庫**: Supabase (PostgreSQL)
- **部署**: Vercel/Netlify
- **數據來源**: 公開 API + Web Scraping (爬蟲)

## 📦 專案狀態

**當前階段: 階段二 - 動態數據連接**

✅ 專案倉庫初始化
✅ 基礎前端靜態頁面搭建
✅ 後端 API (Netlify Functions) 部署完成
✅ 前後端數據連接成功
⏳ 實現即時數據更新
⏳ 開發數據分析與可視化功能
⏳ 整合真實足球數據源

## 🏗 如何本地運行

1.  **克隆倉庫**
    ```bash
    git clone https://github.com/LLO9-prog/soccer-stats-tracker.git
    cd soccer-stats-tracker
    ```

2.  **直接開啟**
    用瀏覽器直接開啟 `index.html` 文件即可預覽前端界面。

3.  **本地測試 API** (可選)
    安裝 Netlify CLI 後運行：
    ```bash
    npm install -g netlify-cli
    ntl dev
    ```

## 👨‍💻 開發者

- [LLO9-prog](https://github.com/LLO9-prog)

## 📄 許可證

此項目僅供學習與個人使用。