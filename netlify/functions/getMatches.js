// netlify/functions/getMatches.js
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  // 設置 CORS 標頭
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 處理預檢請求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight passed' })
    };
  }

  try {
    // 從環境變數獲取 API Key
    const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
    
    console.log('使用 Football-Data.org API...');
    console.log('API Key 存在:', !!API_KEY);

    if (!API_KEY) {
      console.log('未設置 API Key，使用模擬數據');
      return successResponse(generateMockData(), headers);
    }

    // Football-Data.org API 端點
    const API_URL = 'https://api.football-data.org/v4/matches';
    console.log('請求 URL:', API_URL);
    
    const response = await fetch(API_URL, {
      headers: {
        'X-Auth-Token': API_KEY,
        'User-Agent': 'Soccer-Stats-Tracker/1.0'
      }
    });

    console.log('API 響應狀態:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('成功獲取數據，比賽數量:', data.matches ? data.matches.length : 0);
      
      if (data.matches && data.matches.length > 0) {
        const formattedMatches = formatFootballDataMatches(data);
        console.log('格式化後的比賽數量:', formattedMatches.length);
        return successResponse(formattedMatches, headers);
      } else {
        console.log('API 返回空數據，使用模擬數據');
        return successResponse(generateMockData(), headers);
      }
    } else {
      const errorText = await response.text();
      console.log('API 錯誤響應:', errorText);
      console.log('使用模擬數據作為備用');
      return successResponse(generateMockData(), headers);
    }

  } catch (error) {
    console.error('獲取數據時發生錯誤:', error.message);
    return successResponse(generateMockData(), headers);
  }
};

// 專門格式化 Football-Data.org 的數據
function formatFootballDataMatches(data) {
  if (!data.matches || data.matches.length === 0) {
    return generateMockData();
  }
  
  return data.matches.map(match => ({
    id: match.id,
    homeTeam: match.homeTeam?.name || 'Unknown Home Team',
    awayTeam: match.awayTeam?.name || 'Unknown Away Team',
    homeScore: match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? 0,
    awayScore: match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? 0,
    status: getMatchStatus(match.status),
    matchTime: match.utcDate ? new Date(match.utcDate) : new Date(),
    stats: {
      shots: getRandomStat('shots'),
      corners: getRandomStat('corners'),
      possession: getRandomStat('possession')
    },
    league: match.competition?.name || 'Unknown League'
  }));
}

// 生成隨機統計數據
function getRandomStat(type) {
  const ranges = {
    'shots': { min: 5, max: 30 },
    'corners': { min: 2, max: 15 },
    'possession': { min: 30, max: 70 }
  };
  const range = ranges[type] || { min: 0, max: 10 };
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

// 獲取比賽狀態
function getMatchStatus(status) {
  const statusMap = {
    'FINISHED': 'FT',
    'IN_PLAY': 'LIVE',
    'PAUSED': 'HT',
    'SCHEDULED': 'UPCOMING',
    'TIMED': 'UPCOMING',
    'POSTPONED': 'POSTPONED',
    'SUSPENDED': 'SUSPENDED',
    'CANCELLED': 'CANCELLED'
  };
  return statusMap[status] || 'UPCOMING';
}

// 生成模擬數據（備用）
function generateMockData() {
  const leagues = ['英超', '西甲', '德甲', '意甲', '法甲'];
  const teams = [
    ['曼城', '兵工廠'], ['曼聯', '利物浦'], ['切爾西', '熱刺'],
    ['巴塞隆納', '皇家馬德里'], ['拜仁', '多特蒙德']
  ];
  
  return teams.map(([home, away], index) => ({
    id: 100 + index,
    homeTeam: home,
    awayTeam: away,
    homeScore: Math.floor(Math.random() * 5),
    awayScore: Math.floor(Math.random() * 5),
    status: ['FT', 'LIVE', 'HT', 'UPCOMING'][index % 4],
    matchTime: new Date(Date.now() + index * 3600000),
    stats: {
      shots: Math.floor(Math.random() * 25) + 5,
      corners: Math.floor(Math.random() * 13) + 2,
      possession: Math.floor(Math.random() * 40) + 30
    },
    league: leagues[index % leagues.length]
  }));
}

// 成功響應函數
function successResponse(data, headers) {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(data)
  };
}