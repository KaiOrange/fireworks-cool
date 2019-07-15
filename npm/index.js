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
    }).option('cool', {
      alias: 'cool',
      demand: false,
      boolean: true,
      describe: '进入Cool模式（点击后烟花尾随）',
    }).option('flicker', {
      alias: 'flicker',
      demand: false,
      boolean: true,
      describe: '进入随机放烟花模式（固定时间随机发一发）',
    }).option('v', {
      alias: 'version',
      demand: false,
      boolean: true,
      describe: '版本号',
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
    var fs = require('fs')
    var pathFile = path.join(__dirname, 'path.txt')
    var appPath = null;
    if (fs.existsSync(pathFile)) {
        appPath = path.join(__dirname, fs.readFileSync(pathFile, 'utf-8'))
    } else {
        throw new Error('Fireworks-cool failed to install correctly, please delete node_modules/fireworks-cool and try installing again')
    }

    //使用子进程调用electron
    var proc = require('child_process')
    var execArgs = ["--NODE_ENV="+process.env.NODE_ENV];
    // var electron = require('./node_modules/electron')
    // var pathFile = path.join(__dirname, "main.js")
    // var execArgs = [pathFile];

    if (process.env.NODE_ENV === "development") {//开发模式的时候
        execArgs.push("--debug=5858");
    }
    if (!!argv.cool) {
      execArgs.push("--mode=cool");
      process.env.mode = "cool"
    } else if(!!argv.flicker){
      execArgs.push("--mode=flicker");
      process.env.mode = "flicker"
    }

    var child = proc.spawn(appPath, execArgs, { stdio: 'inherit' })
    child.on('close', function (code) {
        process.exit(code);
    })
    // 使用Ctrl + C关闭主进程后 自动关闭子进程
    process.on('SIGINT', function () {
      child.kill('SIGHUP');
    });
}