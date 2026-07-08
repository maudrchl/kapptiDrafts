import { ComponentProps, FC } from 'react';
import Button from 'components/Button/Button';
type Props = Pick<ComponentProps<typeof Button>, 'children' | 'className' | 'size' | 'disabled' | 'onClick'>;
export declare const DEFAULT_SIZE = "m";
/**
 * ⬅️ A button to go back
 */
declare const BackButton: FC<Props>;
export default BackButton;
