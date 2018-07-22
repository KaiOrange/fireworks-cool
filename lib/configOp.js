var fs = require("fs");
var path = require("path");
var os = require("os");
// var basePath = path.join(__dirname, "..","config", 'configTexts.json');
var basePath = path.join(os.homedir(), 'fireworks-cool-configs.json');
let defaultObj = { texts: [], settings:{},preset:"Default"};

function readConfig(fn,isNotShowLine){
    fs.readFile(basePath, function (err, data) {
        let obj = defaultObj;
        if (err) {
            createFileIfNotExists();
            writeConfig(JSON.stringify(obj));
        } else {
            try {
                obj = JSON.parse(data.toString());
            } catch (e) {
                writeConfig(JSON.stringify(defaultObj));
            }
        }
        fn(obj);
        if (!isNotShowLine) {//自动换行
            console.log();
        }
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