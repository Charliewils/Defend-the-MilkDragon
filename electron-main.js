const { app, BrowserWindow, shell } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

let mainWindow;
let server;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/truetype',
};

function getRoot() {
  // 打包后文件在 resources/app/；开发时就是项目目录
  return app.isPackaged
    ? path.join(process.resourcesPath, 'app')
    : __dirname;
}

function startServer() {
  return new Promise((resolve, reject) => {
    const root = getRoot();

    server = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      if (urlPath === '/') urlPath = '/index.html';

      const filePath = path.normalize(path.join(root, urlPath));

      // 防止路径穿越
      if (!filePath.startsWith(root)) {
        res.writeHead(403); res.end('Forbidden'); return;
      }

      const ext  = path.extname(filePath).toLowerCase();
      const mime = MIME[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not Found'); return; }
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
      });
    });

    server.listen(0, '127.0.0.1', () => {
      resolve(server.address().port);
    });
    server.on('error', reject);
  });
}

async function createWindow() {
  let port;
  try {
    port = await startServer();
  } catch (e) {
    console.error('HTTP server failed:', e);
    app.quit(); return;
  }

  mainWindow = new BrowserWindow({
    width:     990,
    height:    730,
    minWidth:  990,
    minHeight: 730,
    resizable: false,
    webPreferences: {
      nodeIntegration:  false,
      contextIsolation: true,
    },
    title:           '保卫奶龙',
    backgroundColor: '#0f1a2e',
    show: false,
  });

  // 隐藏菜单栏
  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadURL(`http://127.0.0.1:${port}/index.html`);

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // 外部链接用系统浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(`http://127.0.0.1:${port}`)) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    server?.close();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  server?.close();
  app.quit();
});
