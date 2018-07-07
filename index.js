#!/usr/bin/env node
var configOp = require("./lib/configOp.js");
var path = require('path')
var argv = require('yargs')
    .option('t', {
        alias: 'text',
        demand: false,
        default: '',
        describe: '保存需要显示的文字',
        type: 'string'
    }).option('c', {
        alias: 'clear',
        demand: false,
        boolean: true,
        describe: '是否清空缓存列表',
    }).option('ls', {
        alias: 'list',
        demand: false,
        boolean: true,
        describe: '列出缓存列表',
    }).option('d', {
        alias: 'delete',
        demand: false,
        type: 'number',
        describe: '删除第几个,从1开始',
    }).option('u', {
        alias: 'use',
        demand: false,
        type: 'number',
        describe: '是用列表中的第几个文字',
    })
    .argv;

let isRun = true;

if (!!argv.c) {//清空参数
    configOp.writeConfig();
    console.log("文本已清除!\n");  
    isRun = false;
} 
if (!!argv.d || argv.d === 0) {
    configOp.readConfig((obj)=>{
        let deleteIndex = parseInt(argv.d);
        if (!!obj.texts && obj.texts.length >= deleteIndex && deleteIndex > 0) {
            obj.texts.splice(deleteIndex-1,1);
            configOp.writeConfig(JSON.stringify(obj));
            console.log("删除文本成功!"); 
        } else {
            console.log("删除参数必须大于0小于等于所有文本个数" + obj.texts.length); 
        }
    });
    isRun = false;
}
if (!!argv.t) {
    configOp.readConfig((obj)=>{
        let text = argv.t.toString();
        if (!!obj.texts && ((obj.texts.length > 0 && text !== obj.texts[0]) || obj.texts.length === 0)) {
            obj.texts.unshift(text);
            configOp.writeConfig(JSON.stringify(obj));
        }
        console.log("设置文本成功!"); 
    });
    isRun = false;
}
if (!!argv.ls) {//列表
    configOp.readConfig((obj) => {
        let texts = obj.texts||[];
        if (texts.length === 0) {
            console.log("暂无缓存数据!");
        } else {
            texts.forEach(function(text,index) {
                console.log(index + 1, text)
            });
        }
    });
    isRun = false;
} 
if (!!argv.u || argv.u === 0) {//使用
    configOp.readConfig((obj) => {
        let useIndex = argv.u;
        let length = (obj.texts || []).length;
        if (useIndex < 1 || useIndex > length) {
            console.log("参数必须大于1小于等于总条数" + length);
        } else {
            let texts = obj.texts.splice(useIndex - 1,1);
            obj.texts.unshift(texts[0]);
            configOp.writeConfig(JSON.stringify(obj));
            console.log("文本设置为：" + texts[0]);
        }
    });
    isRun = false;
} 

if (isRun) {
    //使用子进程调用electron
    var electron = require('./node_modules/electron')
    var proc = require('child_process')
    var fs = require('fs')
    var pathFile = path.join(__dirname, "main.js")
    var execArgs = [pathFile];

    if (process.env.NODE_ENV === "development") {//开发模式的时候
        execArgs.push("--debug=5858");
    }

    var child = proc.spawn(electron, execArgs, { stdio: 'inherit' })
    child.on('close', function (code) {
        process.exit(code)
    })
}