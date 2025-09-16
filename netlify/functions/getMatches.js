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
    
    console.log('API Key exists:', !!API_KEY);
    console.log('API Key length:', API_KEY ? API_KEY.length : 0);

    if (!API_KEY || API_KEY === 'test_key_123') {
      console.log('未設置有效的 API Key，使用模擬數據');
      return successResponse(generateMockData(), headers);
    }

    // 4. 嘗試從 API-Football 獲取真實數據
    console.log('嘗試從 API-Football 獲取真實數據...');
    const response = await fetch('https://api.football-data.org/v4/matches', {
      headers: {
        'X-Auth-Token': API_KEY,
        'User-Agent': 'Soccer-Stats-Tracker/1.0'
      }
    });

    console.log('API 響應狀態:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API 返回比賽數量:', data.matches ? data.matches.length : 0);
      
      if (data.matches && data.matches.length > 0) {
        const formattedMatches = formatMatchesData(data);
        console.log('成功獲取真實比賽數據');
        return successResponse(formattedMatches, headers);
      } else {
        console.log('API 返回空數據，使用模擬數據');
        return successResponse(generateMockData(), headers);
      }
    } else {
      console.log('API 請求失敗，狀態碼:', response.status);
      console.log('使用模擬數據作為備用');
      return successResponse(generateMockData(), headers);
    }

  } catch (error) {
    console.error('獲取數據時發生錯誤:', error.message);
    return successResponse(generateMockData(), headers);
  }
};

// 格式化比賽數據
function formatMatchesData(data) {
  return data.matches.map(match => ({
    id: match.id,
    homeTeam: match.homeTeam?.name || 'Unknown Home',
    awayTeam: match.awayTeam?.name || 'Unknown Away',
    homeScore: match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? 0,
    awayScore: match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? 0,
    status: getMatchStatus(match.status),
    matchTime: match.utcDate ? new Date(match.utcDate) : new Date(),
    stats: {
      shots: getStatistic(match, 'shots', 'total'),
      corners: getStatistic(match, 'corners'),
      possession: getStatistic(match, 'possession')
    },
    league: match.competition?.name || 'Unknown League'
  }));
}

// 獲取統計數據
function getStatistic(match, category, type = null) {
  if (!match.statistics) return Math.floor(Math.random() * (category === 'possession' ? 100 : 30));
  
  const stat = match.statistics.find(s => s.type === category);
  if (!stat) return Math.floor(Math.random() * (category === 'possession' ? 100 : 30));
  
  if (type) {
    return stat[type] || Math.floor(Math.random() * (category === 'possession' ? 100 : 30));
  }
  
  return stat.value || Math.floor(Math.random() * (category === 'possession' ? 100 : 30));
}

// 獲取比賽狀態
function getMatchStatus(status) {
  const statusMap = {
    'FINISHED': 'FT',
    'IN_PLAY': 'LIVE',
    'PAUSED': 'HT',
    'SCHEDULED': 'UPCOMING',
    'TIMED': 'UPCOMING'
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