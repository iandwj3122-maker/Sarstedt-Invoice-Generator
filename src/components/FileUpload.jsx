import React, { useCallback } from 'react';

const FileUpload = ({ onFileUpload }) => {
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            onFileUpload(files[0]);
        }
    }, [onFileUpload]);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileUpload(e.target.files[0]);
        }
    };

    return (
        <div
            className="file-upload-container"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <div className="upload-content">
                <div className="upload-icon">📂</div>
                <h3>Drag & Drop your Excel file here</h3>
                <p>or</p>
                <label className="file-input-label">
                    Browse Files
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="file-input"
                    />
                </label>
            </div>
        </div>
    );
};

export default FileUpload;
