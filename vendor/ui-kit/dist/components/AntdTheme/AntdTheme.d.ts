import * as React from 'react';
import './antd-theme.scss';
type AntdThemeProps = {
    children: React.ReactNode;
};
/**
 * An Antd ConfigProvider used to customize the Antd theme 🎨
 * This component must wrap the application.
 */
declare const AntdTheme: ({ children }: AntdThemeProps) => JSX.Element;
export default AntdTheme;
