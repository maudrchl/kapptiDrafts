import React from 'react';
import { Segmented as AntSegmented } from 'antd';
type AntSegmentedProps = React.ComponentProps<typeof AntSegmented>;
type SegmentedProps<T = any> = {
    options: AntSegmentedProps['options'];
    onChange?: (value: T) => void;
    value?: T;
    size?: 'small' | 'middle' | 'large';
};
declare const Segmented: <T = any>({ onChange, options, value, size }: SegmentedProps<T>) => JSX.Element;
export default Segmented;
