// ���T�n������ƵL�ݥ���~���̿� 
// �o���U�� Netlify ���T���]��� 
// netlify/functions/getMatches.js

exports.handler = async function (event, context) {
  // 1. 設置 CORS 標頭，允許我們的Vue前端訪問這個API
  const headers = {
    'Access-Control-Allow-Origin': '*', // 允許所有來源訪問（上線後可替換為您的Netlify網址）
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

  // 3. 模擬從數據庫獲取的數據（將來這裡會替換成從Supabase或爬蟲獲取的真實數據）
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
      id: 201,
      homeTeam: '巴塞隆納',
      awayTeam: '皇家馬德里',
      homeScore: 3,
      awayScore: 2,
      status: 'FT',
      stats: { shots: 25, corners: 9, possession: 62 },
      league: '西甲'
    }
  ];

  // 4. 成功返回數據
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(mockMatchData) // 將數據轉為JSON字符串返回
  };
};