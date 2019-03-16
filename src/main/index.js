import { app, BrowserWindow, Tray, Menu, ipcMain } from 'electron'
let AutoLaunch = require('auto-launch');
let path = require('path');

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let winWidth = 340;
let mainWindow
let tray
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */

  const { x, y } = tray.getBounds();
  mainWindow = new BrowserWindow({
    useContentSize: true,
    // height: 400,
    // width: winWidth,
    titleBarStyle: "hidden",
    resizable: false,
    // fullscreen: false,
    minimizable: false,
    // maximizable: false,
    // closable: false,
    webPreferences: {webSecurity: false},
    // x: x - (winWidth / 2) - 10,
    // y
  });

  mainWindow.loadURL(winURL);

  // mainWindow.on('closed', (event) => {
  //   mainWindow && mainWindow.minimize();
  //   event.preventDefault();
  // });
  //
  // mainWindow.on('minimize',function(event){
  //   event.preventDefault();
  //   mainWindow.hide();
  // });
  mainWindow.on('close',function(){
    mainWindow = null;
    app.quit();
  });

  // 失去焦点隐藏窗口
  mainWindow.on('blur', function() {
    if (mainWindow) {
      mainWindow.hide();
    }
  });

  // 禁止多开
  const shouldQuit = app.makeSingleInstance(() => {
    if (mainWindow) {
      console.log('已经有窗口存在1');
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  if (shouldQuit) {
    app.quit();
  }

  mainWindow && mainWindow.hide();
}


//开机启动
let minecraftAutoLauncher = new AutoLaunch({
  name: 'eos-watcher', //应用名称
  path: process.execPath, //应用绝对路径
  isHidden: false, //是否隐藏启动
  mac: {
    useLaunchAgent: false //是否启用代理启动，默认是AppleScript启动
  }
});

function onReady() {
  const trayPath = process.env.NODE_ENV !== 'development' ?
    path.join(__dirname.replace(/app.asar.*/, ''), 'src/images/watcher.png') :
    'src/images/watcher.png';
  tray = new Tray(trayPath);
  // tray.setToolTip('This is my application.');
  // tray.setTitle('EOS watcher');

  const contextMenu = Menu.buildFromTemplate([
    { label: '添加' },
    { type: 'separator' },
    {
      label: '开机启动',
      type: 'checkbox',
      click: function () {
        minecraftAutoLauncher.isEnabled().then(function (isEnabled) {
          if (isEnabled) {
            minecraftAutoLauncher.disable();
          } else {
            minecraftAutoLauncher.enable();
          }
        }).catch(function (err) {
          console.log(err, 11)
        })
      }
    },
    { type: 'separator' },
    { label: '退出', role: 'quit' }
  ]);

  tray.on('click', function() {
    if (mainWindow && !mainWindow.isVisible()) {
      // 更新数据
      mainWindow.webContents.send('refresh');

      // 显示窗体
      mainWindow.show();
    }
  });

  ipcMain.on('setTray', (event, data) => {
    if (tray) tray.setTitle(data);
  });

  createWindow();
}


app.on('ready', onReady)

// app.on('window-all-closed', () => {
//   // if (process.platform !== 'darwin') {
//     app.quit()
//   // }
// })
//
// app.on('activate', () => {
//   if (mainWindow === null) {
//     createWindow()
//   }
// })

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
