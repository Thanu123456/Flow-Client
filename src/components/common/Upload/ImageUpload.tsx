import React, { useState } from "react";
import { Upload, message } from "antd";
import { InboxOutlined, DeleteOutlined, LoadingOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

interface ImageUploadProps {
    value?: string;
    onChange?: (value: string | undefined) => void;
    placeholder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, placeholder }) => {
    const [loading, setLoading] = useState(false);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const beforeUpload = (file: File) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
            return false;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
            return false;
        }
        return isJpgOrPng && isLt2M;
    };

    const handleChange = async (info: any) => {
        if (info.fileList.length > 0) {
            const file = info.fileList[info.fileList.length - 1].originFileObj;
            if (file) {
                setLoading(true);
                try {
                    const base64 = await fileToBase64(file);
                    setLoading(false);
                    if (onChange) {
                        onChange(base64);
                    }
                } catch (error) {
                    setLoading(false);
                    message.error('Failed to process image');
                }
            }
        } else {
            if (onChange) {
                onChange(undefined);
            }
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onChange) {
            onChange(undefined);
        }
    };

    return (
        <div className="image-upload-container">
            <Dragger
                multiple={false}
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleChange}
                accept=".jpg,.jpeg,.png"
                style={{
                    padding: '16px',
                    background: '#fafafa',
                    border: '1px dashed #d9d9d9',
                    borderRadius: '8px',
                    height: 'auto',
                    minHeight: '120px'
                }}
            >
                {value ? (
                    <div style={{ position: 'relative', width: '100%' }}>
                        <img
                            src={value}
                            alt="Preview"
                            style={{
                                width: '100%',
                                maxHeight: '150px',
                                objectFit: 'contain'
                            }}
                        />
                        <div
                            onClick={handleRemove}
                            style={{
                                position: 'absolute',
                                top: -10,
                                right: -10,
                                background: '#ff4d4f',
                                color: 'white',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                        >
                            <DeleteOutlined style={{ fontSize: '12px' }} />
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="ant-upload-drag-icon">
                            {loading ? <LoadingOutlined /> : <InboxOutlined />}
                        </p>
                        <p className="ant-upload-text">
                            {placeholder || "Click or drag to upload"}
                        </p>
                        <p className="ant-upload-hint">JPEG, PNG up to 2 MB</p>
                    </div>
                )}
            </Dragger>
        </div>
    );
};

export default ImageUpload;
