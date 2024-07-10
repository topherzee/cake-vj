const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

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



// Store samples to a file for each clip.
app.post('/save', (req, res) => {
    const jsonContent = req.body;
    const filePath = req.query.file;

    if (!filePath) {
        return res.status(400).send({ error: 'Query parameter "file" is required' });
    }

    // const fullPath = path.resolve(__dirname, filePath);
    const fullPath = path.join(__dirname, "../public/", filePath);
    
    const dir = path.dirname(fullPath);

    // Debugging: Log the file path and JSON content
    console.log('Full path:', filePath);
    console.log('Full path:', fullPath);
    console.log('Directory:', dir);
    console.log('JSON content:', jsonContent);


    // Ensure the directory exists
    fs.mkdir(dir, { recursive: true }, (err) => {
        console.log("z");
        if (err) {
            console.log("y ", err);
            return res.status(500).send({ error: 'Failed to create directory' });
        }

        const jsonString = JSON.stringify(jsonContent, null, 2);

        if (!jsonString) {
            return res.status(400).send({ error: 'Invalid JSON content' });
        }
        console.log("a");

        fs.writeFile(fullPath, jsonString, (err) => {
            console.log("b");
            if (err) {
                console.log("c err", err);
                return res.status(500).send({ error: 'Failed to write to file' });
            }
            console.log("d");
            res.send({ message: 'File has been saved successfully' });
        });


    });


    
});



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
