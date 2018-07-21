const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;

// listen for the app to be ready

app.on('ready', () => {
  // create new window
  mainWindow = new BrowserWindow({});
  // load html into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  // quit app on close
  mainWindow.on('close', app.quit);

  // build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // insert the menu
  Menu.setApplicationMenu(mainMenu);
});

// handle create add window
function createAddWindow() {
  // create new window
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add shopping list item'
  });
  // load html into window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  // garbage collection
  addWindow.on('close', () => { addWindow = null; });
}

// catch item:add
ipcMain.on('item:add', (e, item) => {
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
})

// create menu template
const mainMenuTemplate = [
  {
    label: 'file',
    submenu: [
      {
        label: 'Add Item',
        accelerator: process.platform === 'darwin' ? 'Command+N' : 'Ctrl+N',
        click: () => createAddWindow()
      },
      {
        label: 'Clear Items',
        accelerator: process.platform === 'darwin' ? 'Command+C' : 'Ctrl+C',
        click: () => {
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  }
];

// if on mac, add empty object to menu
if (process.platform === 'darwin') {
  mainMenuTemplate.unshift({});
}

// add develop tools item if not not in production
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
        click: (item, focusedWindow) => {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}