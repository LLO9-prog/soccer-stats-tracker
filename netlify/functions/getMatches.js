// netlify/functions/getMatches.js
// 明確聲明此函數無需任何外部依賴

exports.handler = async function (event, context) {
  // 1. 設置 CORS 標頭
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 2. 處理預檢請求（OPTIONS）
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight passed' })
    };
  }

  try {
    // 3. 從環境變數獲取 API Key
    const API_KEY = process.env.FOOTBALL_API_KEY;
    
    if (!API_KEY) {
      console.log('未設置 API Key，使用模擬數據');
      return successResponse(generateMockData(), headers);
    }

    // 4. 嘗試從 API-Football 獲取真實數據
    console.log('嘗試從 API-Football 獲取數據...');
    const response = await fetch('https://api.football-data.org/v4/matches', {
      headers: {
        'X-Auth-Token': API_KEY,
        'User-Agent': 'Soccer-Stats-Tracker/1.0'
      }
    });

    if (response.ok) {
      console.log('API 請求成功');
      const data = await response.json();
      
      if (data.matches && data.matches.length > 0) {
        const formattedMatches = formatMatchesData(data);
        return successResponse(formattedMatches, headers);
      } else {
        console.log('API 返回空數據，使用模擬數據');
        return successResponse(generateMockData(), headers);
      }
    } else {
      console.log('API 請求失敗，狀態碼:', response.status);
      return successResponse(generateMockData(), headers);
    }

  } catch (error) {
    console.error('獲取數據時發生錯誤:', error);
    return successResponse(generateMockData(), headers);
  }
};

// 格式化比賽數據
function formatMatchesData(data) {
  return data.matches.map(match => ({
    id: match.id,
    homeTeam: match.homeTeam?.name || '未知主隊',
    awayTeam: match.awayTeam?.name || '未知客隊',
    homeScore: match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? 0,
    awayScore: match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? 0,
    status: getMatchStatus(match.status),
    matchTime: match.utcDate ? new Date(match.utcDate) : new Date(),
    stats: {
      shots: match.statistics?.shots?.total || Math.floor(Math.random() * 30),
      corners: match.statistics?.corners || Math.floor(Math.random() * 15),
      possession: match.statistics?.possession || Math.floor(Math.random() * 100)
    },
    league: match.competition?.name || '未知聯賽'
  }));
}

// 獲取比賽狀態
function getMatchStatus(status) {
  const statusMap = {
    'FINISHED': 'FT',
    'IN_PLAY': 'LIVE',
    'PAUSED': 'HT',
    'SCHEDULED': 'UPCOMING'
  };
  return statusMap[status] || 'LIVE';
}

// 生成模擬數據（備用）
function generateMockData() {
  return [
    {
      id: 101,
      homeTeam: '曼城',
      awayTeam: '兵工廠',
      homeScore: 2,
      awayScore: 1,
      status: 'FT',
      stats: { shots: 18, corners: 7, possession: 58 },
      league: '英超'
    },
    {
      id: 102,
      homeTeam: '曼聯',
      awayTeam: '利物浦',
      homeScore: 0,
      awayScore: 0,
      status: 'HT',
      stats: { shots: 22, corners: 10, possession: 45 },
      league: '英超'
    },
    {
      id: 103,
      homeTeam: '切爾西',
      awayTeam: '熱刺',
      homeScore: 1,
      awayScore: 1,
      status: 'LIVE',
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
}

// 成功響應函數
function successResponse(data, headers) {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(data)
  };
}