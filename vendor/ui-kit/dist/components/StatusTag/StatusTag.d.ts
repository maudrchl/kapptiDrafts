import * as React from 'react';
import { StatusTagColor, StatusTagVariant } from './utils';
type StatusTagProps = {
    variant: StatusTagVariant;
    color: StatusTagColor;
    children?: string;
    icon?: React.ReactNode | string;
    tooltip?: string;
    tooltipMaxWidth?: string;
};
declare const StatusTag: ({ variant, color, children, icon, tooltip, tooltipMaxWidth }: StatusTagProps) => JSX.Element;
export default StatusTag;
