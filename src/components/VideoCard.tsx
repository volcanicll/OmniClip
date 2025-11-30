import type { VideoInfo } from '../types';
import { formatDuration, formatFileSize, getPlatformName } from '../utils/formatters';
import { getProxyUrl } from '../utils/proxy';

interface VideoCardProps {
    videoInfo: VideoInfo;
    onReset: () => void;
}

export function VideoCard({ videoInfo, onReset }: VideoCardProps) {
    const platform = videoInfo.platform || 'unknown';

    // Helper to get download URL (proxy or direct)
    const getDownloadLink = (url: string, filename: string) => {
        // Use proxy for Bilibili and Douyin/TikTok to bypass Referer checks
        if (['bilibili', 'douyin', 'tiktok'].includes(platform)) {
            return getProxyUrl(url, platform, filename);
        }
        return url;
    };

    return (
        <div className="video-card">
            {/* Thumbnail */}
            {videoInfo.thumbnail && (
                <div className="video-thumbnail">
                    <img src={videoInfo.thumbnail} alt={videoInfo.title} />
                    {videoInfo.duration && (
                        <span className="duration-badge">
                            {formatDuration(videoInfo.duration)}
                        </span>
                    )}
                </div>
            )}

            {/* Video Info */}
            <div className="video-info">
                <div className="video-header">
                    <h2 className="video-title">{videoInfo.title}</h2>
                    <span className="platform-tag">
                        {getPlatformName(platform)}
                    </span>
                </div>

                <div className="video-meta">
                    {videoInfo.width && videoInfo.height && (
                        <div className="meta-item">
                            <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>{videoInfo.width} × {videoInfo.height}</span>
                        </div>
                    )}
                    {videoInfo.filesize && videoInfo.filesize > 0 && (
                        <div className="meta-item">
                            <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span>{formatFileSize(videoInfo.filesize)}</span>
                        </div>
                    )}
                    {videoInfo.format && (
                        <div className="meta-item">
                            <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{videoInfo.format.toUpperCase()}</span>
                        </div>
                    )}
                </div>

                {/* Download Buttons */}
                <div className="download-actions">
                    {videoInfo.download_type === 'single' && videoInfo.download_url && (
                        <a
                            href={getDownloadLink(videoInfo.download_url, `${videoInfo.title}.${videoInfo.format || 'mp4'}`)}
                            download={`${videoInfo.title}.${videoInfo.format || 'mp4'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-download"
                        >
                            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>下载视频</span>
                        </a>
                    )}

                    {videoInfo.download_type === 'separate' && (
                        <>
                            {videoInfo.note && (
                                <div className="info-banner">
                                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>{videoInfo.note}</p>
                                </div>
                            )}
                            <div className="separate-downloads">
                                {videoInfo.video_url && (
                                    <a
                                        href={getDownloadLink(videoInfo.video_url, `${videoInfo.title}_video.mp4`)}
                                        download={`${videoInfo.title}_video.mp4`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-download-alt"
                                    >
                                        <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span>下载视频流</span>
                                    </a>
                                )}
                                {videoInfo.audio_url && (
                                    <a
                                        href={getDownloadLink(videoInfo.audio_url, `${videoInfo.title}_audio.m4a`)}
                                        download={`${videoInfo.title}_audio.m4a`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-download-alt"
                                    >
                                        <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                        <span>下载音频流</span>
                                    </a>
                                )}
                            </div>
                        </>
                    )}

                    <button onClick={onReset} className="btn btn-secondary">
                        <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>下载其他视频</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
