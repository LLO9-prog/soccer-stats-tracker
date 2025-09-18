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

    // 檢查請求參數，支持過濾和分頁
    const { league = '', status = '', limit = 50 } = event.queryStringParameters || {};

    if (!API_KEY) {
      console.log('未設置 API Key，使用模擬數據');
      const mockData = generateMockData();
      return successResponse(applyFilters(mockData, { league, status, limit }), headers);
    }

    // 構建 API 請求 URL
    let API_URL = 'https://api.football-data.org/v4/matches';
    const params = [];
    
    if (league) params.push(`competitions=${league}`);
    if (status) params.push(`status=${status}`);
    if (params.length > 0) {
      API_URL += `?${params.join('&')}`;
    }

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
        const filteredMatches = applyFilters(formattedMatches, { league, status, limit });
        console.log('格式化後的比賽數量:', filteredMatches.length);
        return successResponse(filteredMatches, headers);
      } else {
        console.log('API 返回空數據，使用模擬數據');
        const mockData = generateMockData();
        return successResponse(applyFilters(mockData, { league, status, limit }), headers);
      }
    } else {
      const errorText = await response.text();
      console.log('API 錯誤響應:', errorText);
      console.log('使用模擬數據作為備用');
      const mockData = generateMockData();
        return successResponse(applyFilters(mockData, { league, status, limit }), headers);
    }

  } catch (error) {
    console.error('獲取數據時發生錯誤:', error.message);
    const mockData = generateMockData();
    const { league = '', status = '', limit = 50 } = event.queryStringParameters || {};
    return successResponse(applyFilters(mockData, { league, status, limit }), headers);
  }
};

// 專門格式化 Football-Data.org 的數據
function formatFootballDataMatches(data) {
  if (!data.matches || data.matches.length === 0) {
    return generateMockData();
  }
  
  return data.matches.map(match => {
    const homeScore = match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? match.score?.regularTime?.home ?? 0;
    const awayScore = match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? match.score?.regularTime?.away ?? 0;
    
    return {
      id: match.id,
      homeTeam: match.homeTeam?.name || 'Unknown Home Team',
      awayTeam: match.awayTeam?.name || 'Unknown Away Team',
      homeScore: homeScore,
      awayScore: awayScore,
      status: getMatchStatus(match.status),
      matchTime: match.utcDate ? new Date(match.utcDate) : new Date(),
      stats: {
        shots: getRandomStat('shots'),
        shotsOnTarget: getRandomStat('shotsOnTarget'),
        corners: getRandomStat('corners'),
        possession: getRandomStat('possession'),
        fouls: getRandomStat('fouls'),
        offsides: getRandomStat('offsides')
      },
      league: match.competition?.name || 'Unknown League',
      competitionId: match.competition?.id,
      area: match.area?.name,
      venue: match.venue || 'Unknown Venue',
      matchday: match.matchday,
      stage: match.stage || 'REGULAR_SEASON',
      group: match.group,
      lastUpdated: match.lastUpdated || new Date().toISOString()
    };
  });
}

// 生成隨機統計數據（更真實的範圍）
function getRandomStat(type) {
  const ranges = {
    'shots': { min: 3, max: 25 },
    'shotsOnTarget': { min: 1, max: 12 },
    'corners': { min: 1, max: 15 },
    'possession': { min: 25, max: 75 },
    'fouls': { min: 8, max: 25 },
    'offsides': { min: 0, max: 8 },
    'yellowCards': { min: 0, max: 6 },
    'redCards': { min: 0, max: 2 }
  };
  const range = ranges[type] || { min: 0, max: 10 };
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

// 獲取比賽狀態（更詳細的映射）
function getMatchStatus(status) {
  const statusMap = {
    'FINISHED': 'FT',
    'IN_PLAY': 'LIVE',
    'PAUSED': 'HT',
    'SCHEDULED': 'UPCOMING',
    'TIMED': 'UPCOMING',
    'POSTPONED': 'POSTPONED',
    'SUSPENDED': 'SUSPENDED',
    'CANCELLED': 'CANCELLED',
    'AWARDED': 'AWARDED',
    'INTERRUPTED': 'INTERRUPTED'
  };
  return statusMap[status] || 'UPCOMING';
}

// 應用過濾器
function applyFilters(matches, filters) {
  let filtered = matches;
  
  if (filters.league) {
    filtered = filtered.filter(match => 
      match.league.includes(filters.league) || 
      match.area?.includes(filters.league)
    );
  }
  
  if (filters.status) {
    filtered = filtered.filter(match => 
      match.status === filters.status.toUpperCase()
    );
  }
  
  if (filters.limit) {
    filtered = filtered.slice(0, parseInt(filters.limit));
  }
  
  return filtered;
}

// 生成更真實的模擬數據（備用）
function generateMockData() {
  const leagues = [
    { name: '英超', area: 'England', id: 'PL' },
    { name: '西甲', area: 'Spain', id: 'PD' },
    { name: '德甲', area: 'Germany', id: 'BL1' },
    { name: '意甲', area: 'Italy', id: 'SA' },
    { name: '法甲', area: 'France', id: 'FL1' },
    { name: '歐冠', area: 'Europe', id: 'CL' }
  ];

  const teams = [
    ['曼城', '兵工廠'], ['曼聯', '利物浦'], ['切爾西', '熱刺'],
    ['巴塞隆納', '皇家馬德里'], ['拜仁慕尼黑', '多特蒙德'],
    ['祖雲達斯', '國際米蘭'], ['巴黎聖日耳曼', '馬賽'],
    ['AC米蘭', '那不勒斯'], ['馬德里競技', '塞維利亞']
  ];
  
  const statuses = ['FT', 'LIVE', 'HT', 'UPCOMING'];
  const venues = ['伊蒂哈德球場', '酋長球場', '老特拉福德球場', '安菲爾德球場', '諾坎普球場', '伯納烏球場'];
  
  return teams.map(([home, away], index) => {
    const league = leagues[index % leagues.length];
    const status = statuses[index % statuses.length];
    const homeScore = status === 'UPCOMING' ? 0 : Math.floor(Math.random() * 5);
    const awayScore = status === 'UPCOMING' ? 0 : Math.floor(Math.random() * 5);
    
    return {
      id: 1000 + index,
      homeTeam: home,
      awayTeam: away,
      homeScore: homeScore,
      awayScore: awayScore,
      status: status,
      matchTime: new Date(Date.now() + (index - 2) * 3600000), // 混合過去和未來的比賽
      stats: {
        shots: getRandomStat('shots'),
        shotsOnTarget: getRandomStat('shotsOnTarget'),
        corners: getRandomStat('corners'),
        possession: getRandomStat('possession'),
        fouls: getRandomStat('fouls'),
        offsides: getRandomStat('offsides'),
        yellowCards: getRandomStat('yellowCards'),
        redCards: getRandomStat('redCards')
      },
      league: league.name,
      competitionId: league.id,
      area: league.area,
      venue: venues[index % venues.length],
      matchday: Math.floor(index / 3) + 1,
      stage: 'REGULAR_SEASON',
      lastUpdated: new Date().toISOString()
    };
  });
}

// 成功響應函數 - 修改為返回物件格式
function successResponse(data, headers) {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      matches: data,  // 將陣列包在 matches 屬性中
      count: data.length,
      timestamp: new Date().toISOString()
    })
  };
}