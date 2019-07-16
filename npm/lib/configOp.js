const fs = require("fs");
const path = require("path");
const os = require("os");

const basePath = path.join(os.homedir(), 'fireworks-cool-configs.json');
const defaultObj = require("../config/defaultConfig.json");

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
    if (fs.existsSync(basePath)) {
        fs.createWriteStream(basePath);
    }
}

function mergeWriteIfVersionLow(){
    readConfig(function (obj){
        if (obj.version < defaultObj.version) {
            let newObj = Object.assign({},obj,defaultObj);
            writeConfig(newObj);
        }
    });
}

module.exports={
    readConfig,
    writeConfig,
    createFileIfNotExists,
    mergeWriteIfVersionLow
}