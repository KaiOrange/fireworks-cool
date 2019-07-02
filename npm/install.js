#!/usr/bin/env node
const downloader = require('./lib/downloader');
const fs = require('fs')
const os = require('os')
const path = require('path')
const extract = require('extract-zip')
const installVersion = require('./package.json').installVersion;
const buildDir = "build";
var platformPath = getPlatformPath()

downloader({
    // baseUrl:"https://github.com/KaiOrange/fireworks-cool/releases/download",
    // 由于国内github下载速度实在太慢了 所以就不使用它的服务了 这里改用ucloud存储
    baseUrl: "http://fireworks-cool.cn-bj.ufileos.com",
    version: installVersion,
    softName: "fireworks-cool",
    platform: os.platform(),//"win32"
    arch: os.arch(),//"x64"
    buildDir:buildDir
},extractFile);

// unzips and makes path.txt point at the correct executable
function extractFile (err, zipPath) {
    if (err) return onerror(err)
    extract(zipPath, { dir: path.join(__dirname, buildDir) }, function (err) {
        if (err) return onerror(err)
        fs.writeFile(path.join(__dirname, 'path.txt'), 
            path.join(buildDir,`fireworks-cool-${os.platform()}-${os.arch()}`,platformPath),
            function (err) {
                if (err) return onerror(err)
                console.log("\nO(∩_∩)O 成功~\n现在输入'fireworks-cool'试试?\n\n")
                fs.unlinkSync(zipPath);//删除文件
            }
        )
    })
}

function onerror (err) {
  throw err
}

function getPlatformPath () {
    var platform = os.platform()

    switch (platform) {
        case 'darwin':
          return 'fireworks-cool.app/Contents/MacOS/fireworks-cool'
        // case 'freebsd':
        // case 'linux':
        //   return 'fireworks-cool'
        case 'win32':
        return 'fireworks-cool.exe'
        default:
        throw new Error('fireworks-cool 不支持你当前的系统: ' + platform)
    }
}