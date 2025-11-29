import { useState } from 'react';
import type { VideoInfo } from '../types';
import { getVideoInfo } from '../api/client';

export function useDownload() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

    const fetchVideoInfo = async (url: string) => {
        setLoading(true);
        setError('');
        setVideoInfo(null);

        try {
            const info = await getVideoInfo(url);

            if (!info.success) {
                throw new Error(info.error || '获取视频信息失败');
            }

            setVideoInfo(info);
            return info;
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || '未知错误';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setVideoInfo(null);
        setError('');
    };

    return {
        loading,
        error,
        videoInfo,
        fetchVideoInfo,
        reset,
    };
}
