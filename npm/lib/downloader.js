const nugget = require('nugget');
const path = require('path');
const fs = require('fs-extra');

class Downloader {
    constructor(opts){
        this.baseUrl = opts.baseUrl;
        this.version = this.formatVersion(opts.version);
        this.softName = opts.softName;
        this.platform = opts.platform;
        this.arch = opts.arch;

        this.cacheFilename = opts.cacheFilename || this.getFileName();
    }
    formatVersion(version){
        if(version[0] === "v"){
            return version;
        }
        return "v" + version;
    }
    getUrl(){
        return `${this.baseUrl}/${this.version}/${this.getFileName()}`;
    }
    getFileName(){
        return `${this.softName}-${this.platform}-${this.arch}.zip`;
    }

    downloadFile (cb, onSuccess) {
        let url = this.getUrl();
        const tempFileName = `tmp-${process.pid}-${path.basename(url)}`
        const nuggetOpts = {
            target: tempFileName,
        }
        nugget(url, nuggetOpts, (errors) => {
            if (errors) {
                return this.handleDownloadError(cb, errors[0])
            }
    
            this.moveFileToCache(tempFileName, cb)
        })
    }
    
    moveFileToCache (filename, cb) {
        let target = this.cacheFilename;
        fs.rename(filename, target, (err) => {
            if (err) {
                fs.unlink(filename, cleanupError => {
                    try {
                        if (cleanupError) {
                            console.error(`Error deleting cache file: ${cleanupError.message}`)
                        }
                    } finally {
                        cb(err)
                    }
                })
            } else {
                cb(false,target);
            }
        })
    }
    
     handleDownloadError (cb, error) {
        if (error.message.indexOf('404') === -1) return cb(error)
        error.message = `Failed to find ${this.softName} v${this.version} for ${this.platform}-${this.arch} at ${this.url}`;
        return cb(error)
    }

}

module.exports = function download (opts, cb) {
    try {
        const downloader = new Downloader(opts)
        downloader.downloadFile(cb)
    } catch (err) {
        cb(err)
    }
  }