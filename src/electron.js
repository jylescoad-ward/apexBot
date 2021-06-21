const { app, remote, BrowserWindow, ipcMain } = require("electron");

const CStorageConstructor = require("./CStorage");

var CStorage = null;

ipcMain.handle('CStorage-connect', (event, dbpath) => {
	return new Promise((resolve,reject) => {
		if (dbpath == undefined) {
			dbpath = require("path").join((app || remote.app).getPath('userData'),"cstorage.sqlite");
			console.log(`[ipcMain.on -> CStorage-connect] Database Location is Undefined, defaulting to ${dbpath}`);
		}

		if (CStorage != null) {
			console.log(`[ipcMain.on -> CStorage-connect] Database Connection Already exists. Dumping and reconnecting.`);

			delete CStorage;
		}
		try {
			CStorage = new CStorageConstructor(dbpath);
		} catch (e) {
			reject(e);
		}

		CStorage.connect().catch(console.error).then(resolve);

	})
});

ipcMain.handle('CStorage-query', (event, ...DatabaseQuery) => {
	return new Promise( (resolve,reject) => {
		if (CStorage == null) reject(new Error("CStorage Not Connected"));
		CStorage.query(DatabaseQuery).then(resolve).catch(reject);
	})
})
ipcMain.handle('CStorage-execute', (event, ...DatabaseQuery) => {
	return new Promise( (resolve,reject) => {
		if (CStorage == null) reject(new Error("CStorage Not Connected"));
		CStorage.execute(DatabaseQuery).then(resolve).catch(reject);
	})
})
ipcMain.handle('CStorage-close', (event) => {
	CStorage.close();
});

process.on('exit', () => CStorage.close());
process.on('SIGHUP', () => CStorage.close());
process.on('SIGINT', () => CStorage.close());
process.on('SIGTERM', () => CStorage.close());

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

