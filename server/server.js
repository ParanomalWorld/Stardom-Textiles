// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Configure paths
const publicPath = path.join(__dirname, '../public');
const downloadsPath = path.join(publicPath, 'downloads');

// Serve static files
app.use(express.static(publicPath));

// APK download route
app.get('/download-app', (req, res) => {
    const filePath = path.join(downloadsPath, 'yodhaplay-app.apk');
    res.download(filePath, 'YodhaPlay-Esports.apk', (err) => {
        if (err) {
            res.status(500).send('Error downloading file');
        }
    });
});

// Handle SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});