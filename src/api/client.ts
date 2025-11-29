import axios from 'axios';
import type { VideoInfo } from '../types';

const api = axios.create({
    baseURL: '/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export async function getVideoInfo(url: string): Promise<VideoInfo> {
    const response = await api.post<VideoInfo>('/get_video_info', { url });
    return response.data;
}

export default api;
