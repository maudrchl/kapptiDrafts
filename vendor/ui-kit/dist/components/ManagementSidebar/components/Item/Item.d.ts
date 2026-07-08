/// <reference types="react" />
export type ItemProps = {
    label: string;
    external?: boolean;
};
declare const Item: ({ label, external }: ItemProps) => JSX.Element;
export default Item;
