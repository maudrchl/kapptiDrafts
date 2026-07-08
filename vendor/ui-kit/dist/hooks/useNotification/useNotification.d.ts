import * as React from 'react';
interface NotificationConfig {
    key?: React.Key;
    canDismiss?: boolean;
    btn?: React.ReactNode;
}
interface Notification {
    info: (message: string, config?: NotificationConfig) => void;
    success: (message: string, config?: NotificationConfig) => void;
    warning: (message: string, config?: NotificationConfig) => void;
    error: (message: string, config?: NotificationConfig) => void;
    loading: (message: string, config?: NotificationConfig) => void;
    destroy: (key?: string) => void;
}
/**
 * NotificationContext
 * This context is used to provide the notification functions to the application
 */
interface NotificationContext {
    notification: Notification;
}
interface NotificationProviderProps {
    children: React.ReactNode;
}
export declare const NotificationContext: React.Context<NotificationContext | null>;
/**
 * NotificationProvider
 * This component is used to provide the notification context to the application
 * @param props
 */
export declare const NotificationProvider: (props: NotificationProviderProps) => JSX.Element;
/**
 * useNotification hook
 * @returns NotificationContext
 */
export declare function useNotification(): NotificationContext;
export {};
