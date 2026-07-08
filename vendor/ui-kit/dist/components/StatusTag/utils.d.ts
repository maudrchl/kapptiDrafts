import * as React from 'react';
export type StatusTagVariant = 'filled' | 'outline' | 'ghost';
export type StatusTagColor = 'success' | 'alert' | 'loading' | 'failed' | 'neutral' | 'warning' | 'info' | 'canceled';
export declare const STATUS_TAG_ICON_DEFAULT_SIZE = 12;
export declare const getIcon: (variant: StatusTagVariant, color: StatusTagColor) => React.ReactElement | undefined;
