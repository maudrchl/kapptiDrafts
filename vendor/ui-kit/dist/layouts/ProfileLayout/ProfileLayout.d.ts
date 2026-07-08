import { ReactNode } from 'react';
type ProfileLayoutProps = {
    children: ReactNode;
    onClose: () => void;
};
declare const ProfileLayout: ({ children, onClose }: ProfileLayoutProps) => JSX.Element;
export default ProfileLayout;
