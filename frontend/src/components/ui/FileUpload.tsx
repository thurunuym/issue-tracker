import React, { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import cn from '../../utils/cn';

export interface FileUploadProps {
  onUpload: (files: File[]) => void;
  isLoading?: boolean;
  maxFiles?: number;
  maxSizeMb?: number;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  isLoading = false,
  maxFiles = 5,
  maxSizeMb = 5,
  className,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;

    const acceptedFiles: File[] = [];
    const sizeLimit = maxSizeMb * 1024 * 1024;

    if (filesList.length > maxFiles) {
      toast.error(`You can upload a maximum of ${maxFiles} files at once.`);
      return;
    }

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      if (file.size > sizeLimit) {
        toast.error(`"${file.name}" exceeds the ${maxSizeMb}MB limits.`);
        continue;
      }
      acceptedFiles.push(file);
    }

    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={cn(
        'w-full border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center text-center cursor-pointer',
        isDragActive
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/10'
          : 'border-gray-300 hover:border-blue-400 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-875',
        isLoading ? 'pointer-events-none opacity-50' : '',
        className
      )}
      onClick={onButtonClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
        accept="image/*,application/pdf,text/*,.zip,.rar"
      />

      <svg
        className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-550 mb-3.5"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="flex text-sm text-gray-650 dark:text-gray-300">
        <span className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          Upload file(s)
        </span>
        <p className="pl-1 text-gray-450 dark:text-gray-500">or drag and drop here</p>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
        Images, PDFs, Text, ZIP (Max {maxFiles} files, up to {maxSizeMb}MB each)
      </p>

      {isLoading && (
        <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing upload...
        </div>
      )}
    </div>
  );
};

export default FileUpload;
