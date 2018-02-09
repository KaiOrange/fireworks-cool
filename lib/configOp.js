var fs = require("fs");
var path = require("path");
var basePath = path.join(__dirname, "..","config", 'configTexts.json');
let defaultObj = { texts: [] };

function readConfig(fn){
    fs.readFile(basePath, function (err, data) {
        let obj = defaultObj;
        if (err) {
            createFileIfNotExists();
            writeConfig(JSON.stringify(obj));
        } else {
            try {
                obj = JSON.parse(data.toString());
            } catch (e) {
                writeConfig(JSON.stringify(obj));
            }
        }
        fn(obj);
    });
}

function writeConfig(data){
    if (!data) {
        data = defaultObj;
    }
    if (typeof data === "object") {
        data = JSON.stringify(data);
    }
    fs.writeFile(basePath, data, function (err) {
        if (err) console.log('写文件操作失败');
    });
}

function createFileIfNotExists(){
    if (fs.exists(basePath)) {
        fs.createWriteStream(basePath);
    }
}



module.exports={
    readConfig,
    writeConfig,
    createFileIfNotExists
}