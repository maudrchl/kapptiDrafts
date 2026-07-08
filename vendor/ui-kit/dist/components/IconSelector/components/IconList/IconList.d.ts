import { ReactNode } from 'react';
export type Icon = {
    label: string;
    component: ReactNode;
    selected?: boolean;
};
type IconListProps = {
    icons: Icon[];
    onClickIcon?: (label: string) => void;
};
declare const IconList: ({ icons, onClickIcon }: IconListProps) => JSX.Element;
export default IconList;
