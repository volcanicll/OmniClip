export interface VideoInfo {
    success: boolean;
    platform?: string;
    title?: string;
    thumbnail?: string;
    duration?: number;
    filesize?: number;
    format?: string;
    download_type?: 'single' | 'separate';
    download_url?: string;
    video_url?: string;
    audio_url?: string;
    width?: number;
    height?: number;
    note?: string;
    error?: string;
}

export interface DownloadRequest {
    url: string;
}
