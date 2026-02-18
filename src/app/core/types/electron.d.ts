export interface ElectronAPI {
    saveLog: (log: any) => Promise<any>;
    getLogs: () => Promise<any[]>;
    isSetupRequired: () => Promise<boolean>;
    setupPassword: (password: string) => Promise<boolean>;
    login: (password: string) => Promise<boolean>;
    changePassword: (data: { oldPassword: string, newPassword: string }) => Promise<boolean>;
    onLogSaved?: (callback: any) => void;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}
