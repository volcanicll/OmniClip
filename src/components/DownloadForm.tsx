import React, { useState } from 'react';
import { isValidUrl } from '../utils/formatters';

interface DownloadFormProps {
    onSubmit: (url: string) => void;
    loading: boolean;
}

export function DownloadForm({ onSubmit, loading }: DownloadFormProps) {
    const [url, setUrl] = useState('');
    const [urlError, setUrlError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedUrl = url.trim();

        if (!trimmedUrl) {
            setUrlError('请输入视频链接');
            return;
        }

        if (!isValidUrl(trimmedUrl)) {
            setUrlError('请输入有效的 URL');
            return;
        }

        setUrlError('');
        onSubmit(trimmedUrl);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
            <div className="form-group">
                <label htmlFor="video-url" className="form-label">
                    视频链接
                </label>
                <div className="input-wrapper">
                    <input
                        id="video-url"
                        type="text"
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value);
                            setUrlError('');
                        }}
                        placeholder="粘贴 X、抖音、B站 或 YouTube 视频链接..."
                        className={`form-input ${urlError ? 'error' : ''}`}
                        disabled={loading}
                    />
                    {urlError && (
                        <p className="error-message">{urlError}</p>
                    )}
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
            >
                {loading ? (
                    <>
                        <span className="spinner"></span>
                        <span>解析中...</span>
                    </>
                ) : (
                    <>
                        <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>获取视频</span>
                    </>
                )}
            </button>

            <div className="supported-platforms">
                <p className="platforms-title">支持的平台：</p>
                <div className="platforms-list">
                    <span className="platform-badge">X (Twitter)</span>
                    <span className="platform-badge">抖音 (Douyin)</span>
                    <span className="platform-badge">TikTok</span>
                    <span className="platform-badge">哔哩哔哩 (Bilibili)</span>
                    <span className="platform-badge">YouTube</span>
                </div>
            </div>
        </form>
    );
}
