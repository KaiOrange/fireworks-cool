// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcMain } = require("electron");
const configOp = require("./lib/configOp.js");


ipcMain.on('get-text-main', function (event, arg) {
    configOp.readConfig((obj)=>{
        let text = "";
        if (!!obj.texts && obj.texts.length > 0) {
            text = obj.texts[0];
        }
        event.sender.send('get-text-reply', text)
    });
})