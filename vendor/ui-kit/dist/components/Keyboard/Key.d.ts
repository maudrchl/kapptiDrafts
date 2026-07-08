import React from 'react';
interface KeyProps {
    width?: number | string;
    height?: number | string;
    pressed: boolean;
    keyValue: string | React.ReactNode;
    className?: string;
    isActive?: boolean;
}
declare const Key: React.FC<KeyProps>;
export default Key;
