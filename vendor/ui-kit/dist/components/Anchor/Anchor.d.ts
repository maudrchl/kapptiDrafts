import { ReactElement } from 'react';
import Item from './component/Item';
type AnchorProps = {
    children: ReactElement<typeof Item>[];
    gap?: number;
    padding?: 'small' | 'large';
    /** Remove the outer padding of the component. */
    noPadding?: boolean;
    /** Remove the surface-grey background of the component. */
    noBackground?: boolean;
};
declare const Anchor: {
    ({ children, padding, noPadding, noBackground }: AnchorProps): JSX.Element;
    Item: ({ title, icon, id, children }: import("./component/Item").ItemProps) => JSX.Element;
};
export default Anchor;
