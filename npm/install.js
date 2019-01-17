#!/usr/bin/env node
const downloader = require('./lib/downloader');
const fs = require('fs')
const os = require('os')
const path = require('path')
const extract = require('extract-zip')
const installVersion = require('./package.json').installVersion;
const buildDir = "build";
var platformPath = getPlatformPath()
// var installedVersion = null
// try {
//   installedVersion = fs.readFileSync(path.join(__dirname, buildDir, 'version'), 'utf-8').replace(/^v/, '')
// } catch (ignored) {
// }

// var electronPath = path.join(__dirname, buildDir, platformPath)

// if (installedVersion === installVersion && fs.existsSync(electronPath)) {
//   process.exit(0)
// }

downloader({
    baseUrl:"https://github.com/KaiOrange/fireworks-cool/releases/download",
    version: installVersion,
    softName:"fireworks-cool",
    platform: os.platform(),//"win32"
    arch: os.arch(),//"x64"
    buildDir:buildDir
},extractFile);

// unzips and makes path.txt point at the correct executable
function extractFile (err, zipPath) {
    if (err) return onerror(err)
    extract(zipPath, { dir: path.join(__dirname, buildDir) }, function (err) {
        if (err) return onerror(err)
        fs.writeFile(path.join(__dirname, 'path.txt'), path.join(buildDir,platformPath), function (err) {
            if (err) return onerror(err)
            console.log("O(∩_∩)O 成功~\n现在输入'fireworks-cool'试试?")
            fs.unlinkSync(zipPath);//删除文件
        })
    })
}

function onerror (err) {
  throw err
}

function getPlatformPath () {
    var platform = os.platform()

    switch (platform) {
        // case 'darwin':
        //   return 'Fireworks-cool.app/Contents/MacOS/Fireworks-cool'
        // case 'freebsd':
        // case 'linux':
        //   return 'fireworks-cool'
        case 'win32':
        return 'fireworks-cool.exe'
        default:
        throw new Error('Fireworks-cool builds are not available on platform: ' + platform)
    }
}