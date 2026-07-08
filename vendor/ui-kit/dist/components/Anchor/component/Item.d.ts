import { ReactElement, ReactNode } from 'react';
type ItemProps = {
    title: ReactNode;
    icon?: ReactElement;
    id: string;
    children: ReactNode;
};
declare const Item: ({ title, icon, id, children }: ItemProps) => JSX.Element;
export default Item;
export type { ItemProps };
