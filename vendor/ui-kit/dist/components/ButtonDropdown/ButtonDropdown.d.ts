import Button from '../Button/Button';
import * as React from 'react';
import Dropdown from '../Dropdown/Dropdown';
type ButtonDropdownProps = React.ComponentProps<typeof Button> & {
    menu: React.ComponentProps<typeof Dropdown>['menu'];
};
declare const ButtonDropdown: ({ children, menu, icon, onClick, counter, ...props }: ButtonDropdownProps) => JSX.Element;
export default ButtonDropdown;
