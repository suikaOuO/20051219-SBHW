const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSY7NZUZlhrODZPFRNQ40zm5MKqbIGiXLwwfFOP_C_Kc78c8jQi3OFFaK7CVqtgGY6p65PCn1aVRVyB/pub?output=csv";

async function initDashboard() {
    try {
        const response = await fetch(CSV_URL);
        const csvText = await response.text();
        
        // 1. 分割行與列，處理可能出現的引號問題
        const rows = csvText.split('\n').map(row => {
            // 這個正則表達式可以正確處理 CSV 中包含逗號的字串
            return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        });
        
        const dataRows = rows.slice(1); // 移除標題列
        console.log("資料讀取成功，共", dataRows.length, "筆回覆");

        // 2. 渲染各個圖表
        renderPieChart('creatureChart', countOccurrences(dataRows, 1)); // 生物
        renderBarChart('deadlineChart', countOccurrences(dataRows, 2)); // 派系
        
        // 睡眠時數：索引 3
        const sleepData = dataRows.map(r => parseFloat(r[3])).filter(n => !isNaN(n));
        renderLineChart('sleepChart', sleepData);

        // 能量條：索引 6
        const energyData = dataRows.map(r => parseFloat(r[6])).filter(n => !isNaN(n));
        const avgEnergy = energyData.length > 0 ? (energyData.reduce((a, b) => a + b) / energyData.length) : 0;
        renderEnergyChart('energyChart', avgEnergy);

    } catch (error) {
        console.error("初始化失敗:", error);
    }
}

// 統計出現次數的工具
function countOccurrences(data, index) {
    const counts = {};
    data.forEach(row => {
        let val = row[index]?.replace(/"/g, '').trim();
        if (val) counts[val] = (counts[val] || 0) + 1;
    });
    return counts;
}

// --- 以下是圖表渲染函數 ---

function renderPieChart(id, obj) {
    new Chart(document.getElementById(id), {
        type: 'doughnut',
        data: {
            labels: Object.keys(obj),
            datasets: [{
                data: Object.values(obj),
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function renderBarChart(id, obj) {
    new Chart(document.getElementById(id), {
        type: 'bar',
        data: {
            labels: Object.keys(obj),
            datasets: [{
                label: '人數',
                data: Object.values(obj),
                backgroundColor: '#4e73df'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function renderLineChart(id, arr) {
    new Chart(document.getElementById(id), {
        type: 'line',
        data: {
            labels: arr.map((_, i) => `同學 ${i+1}`),
            datasets: [{
                label: '每日睡眠時數',
                data: arr,
                borderColor: '#1cc88a',
                fill: false,
                tension: 0.1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function renderEnergyChart(id, avg) {
    new Chart(document.getElementById(id), {
        type: 'bar',
        data: {
            labels: ['全體同學平均能量'],
            datasets: [{
                label: '平均電量 (%)',
                data: [avg.toFixed(1)],
                backgroundColor: '#f6c23e'
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            scales: { y: { min: 0, max: 100 } }
        }
    });
}

initDashboard();