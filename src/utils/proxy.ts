/**
 * Cloudflare Worker Proxy Utility
 */

const PROXY_BASE_URL = 'https://video-download-proxy.flybycan.workers.dev/';

/**
 * Generates a proxy URL for downloading videos with custom headers.
 * 
 * @param url The direct video URL
 * @param platform The platform name (e.g., 'bilibili', 'douyin')
 * @param filename Optional filename for the download
 * @returns The full proxy URL
 */
export function getProxyUrl(url: string, platform: string, filename?: string): string {
    if (!url) return '';

    const params = new URLSearchParams();
    params.append('url', url);

    // Set referer based on platform
    let referer = '';
    if (platform === 'bilibili') {
        referer = 'https://www.bilibili.com/';
    } else if (platform === 'douyin' || platform === 'tiktok') {
        referer = 'https://www.douyin.com/';
    } else if (platform === 'twitter') {
        referer = 'https://twitter.com/';
    }

    if (referer) {
        params.append('referer', referer);
    }

    if (filename) {
        params.append('filename', filename);
    }

    return `${PROXY_BASE_URL}?${params.toString()}`;
}
