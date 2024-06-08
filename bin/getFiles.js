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

// const isFile = fileName => {
//     return fs.lstatSync(fileName).isFile();
//   };
const isFile = fileName => {
    return (fileName.indexOf('.') < 0);
  };

function getDirsInDirectory(dir) {
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
app.get('/files/*', async (req, res) => {
    
    // Extract the part of the URL after '/files'
    const subPath = req.params[0];
    console.log("subPath:" + subPath)
    const directoryPath = path.join(__dirname, '../public/video', subPath);


    //let DIR = '../public/video/DCVS01'
    //const directoryPath = path.join(__dirname, '../public/video/DCVS01'); // replace 'your-directory' with your actual directory
    console.log("get:" + directoryPath)
    
    try {
        let files = await getFilesInDirectory(directoryPath);
        //console.log("files:" + files)
        // files = files.map(i => '/video/DCVS01' + "/" + i);
        files = files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item)); //get rid of .DS_Store..etc
        files = files.map(i => subPath + "/" + i);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Unable to read directory' });
    }
});

// Endpoint to return directories in a directory as JSON
app.get('/dirs/*', async (req, res) => {
    
    // Extract the part of the URL after '/dirs'
    const subPath = req.params[0];
    console.log("Get Dirs. ", subPath);
    // const directoryPath = path.join(__dirname, '../public/video', subPath);
    const directoryPath = path.join(__dirname, '../public/video');

    console.log("get:" + directoryPath)
    
    try {
        let files = await getDirsInDirectory(directoryPath);
        console.log("files:" + files)
        // files = files.map(i => '/video/DCVS01' + "/" + i);
        files = files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item)); //get rid of .DS_Store..etc
        files = files.filter(item => isFile);
        console.log("YO")
        files = files.map(i => subPath + "/" + i);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Unable to read directory' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
