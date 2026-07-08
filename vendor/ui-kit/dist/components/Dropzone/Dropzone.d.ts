/// <reference types="react" />
import { Accept } from 'react-dropzone';
type DropzoneProps = {
    onUploadComplete: (acceptedFiles: File[]) => void;
    description?: string;
    maxFiles?: number;
    fileTypes?: Accept;
};
/**
 * A component that allows users to upload files by dragging and dropping them onto a designated area.
 */
declare const Dropzone: ({ onUploadComplete, description, maxFiles, fileTypes }: DropzoneProps) => JSX.Element;
export default Dropzone;
