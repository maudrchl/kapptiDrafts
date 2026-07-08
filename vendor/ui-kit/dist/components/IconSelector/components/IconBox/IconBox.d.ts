/// <reference types="react" />
type IconBoxProps = {
    icon: any;
    selected?: boolean;
    onClick?: () => void;
};
declare const IconBox: ({ icon: Icon, selected, onClick }: IconBoxProps) => JSX.Element;
export default IconBox;
