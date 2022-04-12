const { dialog, ipcMain, ipcRenderer, contextBridge } = require('electron')

//*MAIN LISTENERS
exports.dialogMain = function main(window) {
    ipcMain.on('show-error-dialog', (event, data) => {
        dialog.showErrorBox(data.title, data.message);
    })

    ipcMain.handle('show-message-dialog', async (event, data) => {
        const showmessage = await dialog.showMessageBox(window, {
            ...data
        })
        return showmessage;
    })

    //TODO Save | Open Dialogs
}

//*RENDER INVOKERS
exports.dialogRender = function render() {
    contextBridge.exposeInMainWorld('dialogs', {
        error: ({ title, message }) => ipcRenderer.send('show-error-dialog', { title, message }),
        message: async (props) => {
            const info = {
                ...props,
                type: props.type || 'info',
                title: props.title || '',
                message: props.message || '',
                detail: props.detail || '',
                buttons: props.buttons || [],
                cancelId: props.cancelId || undefined,
                checkboxChecked: props.checkboxChecked || false,
                checkboxLabel: props.checkboxLabel || '',
                icon: props.icon || ''
            }
            const messageBox = await ipcRenderer.invoke('show-message-dialog', { ...info });
            return messageBox
        }
    })
}