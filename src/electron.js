const { app, BrowserWindow } = require("electron");
if (require('electron-squirrel-startup')) {
	app.quit();
}

function isStandalone() {
	if (module.filename.includes("app.asar")) {
		return true;
	} else {
		return false;
	}
}

let mainWindow;
const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 720,
		minWidth: 1280,
		minHeight: 720,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			v8CacheOptions: 'none',
			kiosk: true,
		},
	});
	mainWindow.loadURL(`file://${__dirname}/index.html`);
	if (!isStandalone()) {
		mainWindow.webContents.openDevTools();
	}
	mainWindow.on('closed', () => {
		mainWindow = null;
	});
};
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required") 
app.on('ready', createWindow);
app.getPath('userData');
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
		process.exit(0);
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});

