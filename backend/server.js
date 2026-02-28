const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, 'data', 'schools.json');

// フロントエンドのビルドファイルを静的ファイルとして配信
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// --- Helper Functions ---
function readData() {
    if (!fs.existsSync(dataPath)) {
        return [];
    }
    const raw = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(raw);
}

function writeData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- API Endpoints ---

// 1. Get all schools data
app.get('/api/schools', (req, res) => {
    const data = readData();
    res.json(data);
});

// 2. Mock Scraper endpoint to update school information
// Since real scraping requires a custom parser for every single school site,
// this endpoint serves as a mock/proxy. It simulates finding new info
// and updating the JSON file.
app.post('/api/update', async (req, res) => {
    try {
        const schools = readData();
        const now = new Date();
        const updatedSchools = [...schools];
        const updateLogs = [];

        // Simulate scraping process for each school
        for (let i = 0; i < updatedSchools.length; i++) {
            let school = updatedSchools[i];

            // In a real scenario, you'd use axios and cheerio here.
            // e.g.
            // const response = await axios.get(school.url);
            // const $ = cheerio.load(response.data);
            // let text = $('body').text();

            // Simulating that we "found" that the festival date is now confirmed.
            // We just randomly append a mock "Confirmed" label occasionally for demonstration.
            if (!school.festivalDate.includes('（更新済）')) {
                school.festivalDate = school.festivalDate + ' （更新済）';
                school.lastUpdated = now.toISOString();
                updateLogs.push(`${school.name}: 情報を更新しました`);
            } else {
                updateLogs.push(`${school.name}: 変更なし`);
            }
        }

        // Save
        writeData(updatedSchools);

        res.json({
            success: true,
            message: "Data update process completed.",
            logs: updateLogs,
            data: updatedSchools
        });

    } catch (error) {
        console.error("Error during scraping update:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// フロントエンドのルートへのアクセスを処理
app.get('/*catchall', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
});
