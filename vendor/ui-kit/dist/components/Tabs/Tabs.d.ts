import * as React from 'react';
import { TabsProps as AntdTabsProps } from 'antd';
export declare const DEFAULT_TYPE = "default";
type TabsProps = {
    type?: 'default' | 'card';
    tabs?: AntdTabsProps['items'];
    defaultActiveKey?: string;
    activeKey?: string;
    className?: string;
    leftExtraContent?: React.ReactNode;
    rightExtraContent?: React.ReactNode;
    centered?: boolean;
    onTabClick?: (key: string) => void;
    onChange?: (key: string) => void;
};
declare const Tabs: ({ tabs, type, defaultActiveKey, activeKey, className, leftExtraContent, rightExtraContent, centered, onTabClick, onChange, }: TabsProps) => JSX.Element;
export default Tabs;
