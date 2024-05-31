const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
// const corsOptions = {
//     origin: 'https://www.nileshblog.tech/',//(https://your-client-app.com)
//     optionsSuccessStatus: 200,
//   };
//   app.options('*', cors())

// Function to get list of files in a directory
function getFilesInDirectory(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

// Endpoint to return files in a directory as JSON
app.get('/files', async (req, res) => {
    

    let DIR = '../public/video/DCVS01'
    const directoryPath = path.join(__dirname, '../public/video/DCVS01'); // replace 'your-directory' with your actual directory
    console.log("get:" + directoryPath)
    try {
        let files = await getFilesInDirectory(directoryPath);
        //console.log("files:" + files)
files = files.map(i => '/video/DCVS01' + "/" + i);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Unable to read directory' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
