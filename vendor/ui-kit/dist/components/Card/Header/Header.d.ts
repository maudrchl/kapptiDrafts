import { ComponentType, ReactNode } from 'react';
import { IconProps } from 'lib';
type HeaderProps = {
    icon?: ComponentType<IconProps>;
    title: string;
    asideContent?: ReactNode;
    className?: string;
};
declare const Header: ({ icon: Icon, title, asideContent, className }: HeaderProps) => JSX.Element;
export default Header;
