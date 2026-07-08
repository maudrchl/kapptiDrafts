/// <reference types="react" />
type FooterProps = {
    timezone: string;
    openModal: () => void;
};
declare const Footer: ({ timezone, openModal }: FooterProps) => JSX.Element;
export default Footer;
