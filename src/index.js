const toolbox = require("tinytoolbox");
global.$ = require("jquery");
const { ipcRenderer } = require('electron')

global.ALTM = {
	store: {
		query: (...sql) => {
			return new Promise((resolve,reject) => {
				if (sql.length == 1) {
					ipcRenderer.invoke('CStorage-query',sql[0]).then(resolve).catch(reject);
				} else {
					ipcRenderer.invoke('CStorage-query',sql.join(' ')).then(resolve).catch(reject);
				}
			})
		},
		execute: (...sql) => {
			return new Promise((resolve,reject) => {
				if (sql.length == 1) {
					ipcRenderer.invoke('CStorage-execute',sql[0]).then(resolve).catch(reject);
				} else {
					ipcRenderer.invoke('CStorage-execute',sql.join(' ')).then(resolve).catch(reject);
				}
			})
		},
		connect: () => {
			return new Promise((resolve,reject) => {
				ipcRenderer.invoke('CStorage-connect', localStorage.CStorage_Location).then(resolve).catch(reject);
			})
		},
		close: () => {
			return new Promise((resolve,reject) => {
				ipcRenderer.invoke('CStorage-close').then(resolve).catch(reject);
			})
		}
	}
}
ipcRenderer.on('CStorage-error',console.error);
ipcRenderer.invoke('CStorage-connect', localStorage.CStorage_Location);