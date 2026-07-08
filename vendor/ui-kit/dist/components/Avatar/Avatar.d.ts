/// <reference types="react" />
import { AvatarSize } from 'antd/es/avatar/AvatarContext';
export declare const DEFAULT_DISABLED = false;
export declare const DEFAULT_SIZE = "default";
type AvatarProps = {
    name: string;
    additionalName?: string;
    disabled?: boolean;
    size?: AvatarSize;
};
/**
 * 🧑‍🦲A circle with the initials of the name of a person.
 * It takes the first letter of the name and the first letter of the additional name if there is one.
 * One day, it could be used to display a profile picture.
 */
declare const Avatar: ({ name, additionalName, disabled, size }: AvatarProps) => JSX.Element;
export default Avatar;
