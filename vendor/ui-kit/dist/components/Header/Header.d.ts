/// <reference types="react" />
type HeaderProps = {
    onMenu?: () => void;
    onClose: () => void;
};
export declare const BRAND_WIDTH = 128;
declare const Header: ({ onMenu, onClose }: HeaderProps) => JSX.Element;
export default Header;
