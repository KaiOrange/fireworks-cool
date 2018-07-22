// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcMain } = require("electron");
const configOp = require("./lib/configOp.js");


ipcMain.on('get-text-main', function (event, arg) {
    configOp.readConfig((obj)=>{
        event.sender.send('get-text-reply', obj)
    },true);
})

ipcMain.on('setting-change-all', function (event, arg) {
    configOp.readConfig((obj)=>{
        if (!!arg.settings) {
            obj.settings = arg.settings;
        }
        if (!!arg.preset) {
            obj.preset = arg.preset;
        }
        configOp.writeConfig(obj);
    },true);
})

ipcMain.on('setting-change', function (event, arg) {
    configOp.readConfig((obj)=>{
        let isUpdate = false;
        if (!obj.settings) {//如果没有值的时候就设置成初始的 有的时候赋值
            obj.settings = {};
            isUpdate = true;
        } else {
            if (arg.value !== obj.settings[arg.key]) {
                obj.settings[arg.key] = arg.value;
                isUpdate = true;
            }
        }
        if (isUpdate) {
            configOp.writeConfig(obj);
        }
    },true);
})

ipcMain.on('set-text', function (event, arg) {
    configOp.readConfig((obj)=>{
        let text = arg;
        if (!obj.texts) {
            obj.texts = [];
        }
        if ((obj.texts.length > 0 && text !== obj.texts[0]) || obj.texts.length === 0) {
            obj.texts.unshift(text);
            configOp.writeConfig(JSON.stringify(obj));
        }
    },true);
})