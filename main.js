const electron = require('electron')
// Module to control application life.
const {app,session,ipcMain,BrowserWindow,systemPreferences} = electron;
// const session = electron.session;
// const ipc = electron.ipcMain;
// Module to create native browser window.
// const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

//是否是开发环境
const isDev = process.env.NODE_ENV === "development";
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  let browserOptions = {
    fullscreen: true,
    simpleFullscreen:true, 
    transparent: true, 
    frame: false,
    show: false,
    resizable:false,
    titleBarStyle: 'hidden',
  };
  if(isDev){
    mainWindow = new BrowserWindow(browserOptions);
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
  } else {
	  browserOptions.alwaysOnTop = true;
    mainWindow = new BrowserWindow(browserOptions);
    mainWindow.setIgnoreMouseEvents(true);
    mainWindow.setVisibleOnAllWorkspaces(true)
  }
  
  mainWindow.once('ready-to-show', () => {
		mainWindow.show()
  })
  
  mainWindow.focus();
  mainWindow.setSkipTaskbar(true);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './src/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('app-quit', function (event, arg) {
  // app.quit();
  // 暴力退出
  app.exit()
})

ipcMain.on('goto-hidden-mode', function (event, arg) {
  if (arg === "flicker") {
    return;
  } else {
    if (!!mainWindow) {
      mainWindow.setIgnoreMouseEvents(false);
    }
  }
})

require('./renderer.js');
