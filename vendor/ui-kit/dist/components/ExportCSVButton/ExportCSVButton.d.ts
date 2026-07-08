/// <reference types="react" />
type ExportCSVButtonProps = {
    fields: string[];
    fileName: string;
    data?: any[];
    isLoading?: boolean;
    onClick?: () => void;
    onGetData?: () => Promise<any[]>;
};
declare const ExportCSVButton: ({ data, fields, fileName, isLoading, onClick, onGetData }: ExportCSVButtonProps) => JSX.Element;
export default ExportCSVButton;
