// netlify/functions/getMatches.js
// 明確聲明此函數無需任何外部依賴
// 這有助於 Netlify 正確打包函數

exports.handler = async function (event, context) {
  // 1. 設置 CORS 標頭，允許我們的Vue前端訪問這個API
  const headers = {
    'Access-Control-Allow-Origin': '*', // 允許所有來源訪問
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // 2. 處理預檢請求（OPTIONS）
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight passed' })
    };
  }

  // 3. 添加 WebSocket/SSE 支持檢查
  if (event.queryStringParameters && event.queryStringParameters.stream === 'true') {
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
      body: `data: ${JSON.stringify(mockMatchData)}\n\n`
    };
  }

  // 4. 模擬從數據庫獲取的數據
  const mockMatchData = [
    {
      id: 101,
      homeTeam: '曼城',
      awayTeam: '兵工廠',
      homeScore: 2,
      awayScore: 1,
      status: 'FT', // FT: 全場結束
      stats: { shots: 18, corners: 7, possession: 58 },
      league: '英超'
    },
    {
      id: 102,
      homeTeam: '曼聯',
      awayTeam: '利物浦',
      homeScore: 0,
      awayScore: 0,
      status: 'HT', // HT: 中場
      stats: { shots: 22, corners: 10, possession: 45 },
      league: '英超'
    },
    {
      id: 103,
      homeTeam: '切爾西',
      awayTeam: '熱刺',
      homeScore: 1,
      awayScore: 1,
      status: 'LIVE', // LIVE: 進行中
      stats: { shots: 15, corners: 6, possession: 52 },
      league: '英超'
    },
    {
      id: 201,
      homeTeam: '巴塞隆納',
      awayTeam: '皇家馬德里',
      homeScore: 3,
      awayScore: 2,
      status: 'FT',
      stats: { shots: 25, corners: 9, possession: 62 },
      league: '西甲'
    },
    {
      id: 202,
      homeTeam: '馬德里競技',
      awayTeam: '塞維利亞',
      homeScore: 1,
      awayScore: 0,
      status: 'LIVE',
      stats: { shots: 12, corners: 5, possession: 48 },
      league: '西甲'
    }
  ];

  // 5. 成功返回數據
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(mockMatchData) // 將數據轉為JSON字符串返回
  };
};