from http.server import BaseHTTPRequestHandler
import json
import yt_dlp
from urllib.parse import parse_qs
import traceback


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        """Handle video info extraction"""
        try:
            # Parse request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            url = data.get('url', '').strip()
            
            if not url:
                self.send_error_response(400, 'URL is required')
                return
            
            # Detect platform
            platform = self.detect_platform(url)
            
            # Get video info based on platform
            if platform == 'bilibili':
                result = self.get_bilibili_info(url)
            else:
                result = self.get_standard_info(url)
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            error_msg = str(e)
            traceback_str = traceback.format_exc()
            print(f"Error: {error_msg}\n{traceback_str}")
            self.send_error_response(500, f'Failed to process video: {error_msg}')

    def detect_platform(self, url):
        """Detect video platform from URL"""
        url_lower = url.lower()
        if 'bilibili.com' in url_lower or 'b23.tv' in url_lower:
            return 'bilibili'
        elif 'twitter.com' in url_lower or 'x.com' in url_lower:
            return 'twitter'
        elif 'douyin.com' in url_lower or 'tiktok.com' in url_lower:
            return 'tiktok'
        else:
            return 'unknown'

    def get_standard_info(self, url):
        """Get video info for Twitter/TikTok/Douyin using standard format"""
        platform = self.detect_platform(url)
        
        # Base configuration
        ydl_opts = {
            'format': 'best[ext=mp4]/best',
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'socket_timeout': 8,
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
            },
        }
        
        # Platform-specific configuration
        if platform == 'tiktok':
            ydl_opts['http_headers']['Referer'] = 'https://www.douyin.com/'
            # Try without cookies first, fallback if needed
            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=False)
            except Exception as e:
                error_msg = str(e)
                if 'cookie' in error_msg.lower():
                    # Return helpful error for cookie requirement
                    raise Exception('Douyin/TikTok requires cookies for some videos. Please try a different public video or use the mobile share link.')
                raise
        else:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
        
        # Get direct URL
        direct_url = info.get('url')
        
        # If formats available, try to get best quality
        if 'formats' in info and info['formats']:
            # Find best mp4 format
            mp4_formats = [f for f in info['formats'] if f.get('ext') == 'mp4']
            if mp4_formats:
                # Sort by quality
                best_format = max(mp4_formats, key=lambda f: f.get('height', 0) or 0)
                direct_url = best_format.get('url', direct_url)
        
        return {
            'success': True,
            'platform': platform,
            'title': info.get('title', 'Unknown'),
            'thumbnail': info.get('thumbnail', ''),
            'duration': info.get('duration', 0),
            'filesize': info.get('filesize') or info.get('filesize_approx', 0),
            'format': info.get('ext', 'mp4'),
            'download_type': 'single',
            'download_url': direct_url,
            'width': info.get('width', 0),
            'height': info.get('height', 0),
        }

    def get_bilibili_info(self, url):
        """Get video info for Bilibili with special handling"""
        # Configuration with anti-bot headers
        ydl_opts = {
            'format': 'best[ext=mp4][acodec!=none]/best[ext=mp4]',
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'socket_timeout': 8,
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.bilibili.com/',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
            },
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            title = info.get('title', 'Unknown')
            thumbnail = info.get('thumbnail', '')
            duration = info.get('duration', 0)
            
            # Check if we have a single file with audio
            formats = info.get('formats', [])
            
            # Try to find a single mp4 with both video and audio
            single_mp4 = None
            for fmt in formats:
                if (fmt.get('ext') == 'mp4' and 
                    fmt.get('vcodec') != 'none' and 
                    fmt.get('acodec') != 'none'):
                    single_mp4 = fmt
                    break
            
            if single_mp4:
                # Found single mp4 with audio
                return {
                    'success': True,
                    'platform': 'bilibili',
                    'title': title,
                    'thumbnail': thumbnail,
                    'duration': duration,
                    'filesize': single_mp4.get('filesize') or single_mp4.get('filesize_approx', 0),
                    'format': 'mp4',
                    'download_type': 'single',
                    'download_url': single_mp4.get('url'),
                    'width': single_mp4.get('width', 0),
                    'height': single_mp4.get('height', 0),
                }
            else:
                # Need separate video and audio streams
                video_format = None
                audio_format = None
                
                # Find best video stream
                video_formats = [f for f in formats if f.get('vcodec') != 'none' and f.get('acodec') == 'none']
                if video_formats:
                    video_format = max(video_formats, key=lambda f: f.get('height', 0) or 0)
                
                # Find best audio stream
                audio_formats = [f for f in formats if f.get('acodec') != 'none' and f.get('vcodec') == 'none']
                if audio_formats:
                    audio_format = max(audio_formats, key=lambda f: f.get('abr', 0) or 0)
                
                if video_format and audio_format:
                    return {
                        'success': True,
                        'platform': 'bilibili',
                        'title': title,
                        'thumbnail': thumbnail,
                        'duration': duration,
                        'filesize': (video_format.get('filesize', 0) or 0) + (audio_format.get('filesize', 0) or 0),
                        'format': 'mp4',
                        'download_type': 'separate',
                        'video_url': video_format.get('url'),
                        'audio_url': audio_format.get('url'),
                        'width': video_format.get('width', 0),
                        'height': video_format.get('height', 0),
                        'note': 'Video and audio are separate streams. Download both and merge using FFmpeg or a video editor.'
                    }
                else:
                    # Fallback to best available
                    return {
                        'success': True,
                        'platform': 'bilibili',
                        'title': title,
                        'thumbnail': thumbnail,
                        'duration': duration,
                        'filesize': info.get('filesize') or info.get('filesize_approx', 0),
                        'format': info.get('ext', 'mp4'),
                        'download_type': 'single',
                        'download_url': info.get('url'),
                        'width': info.get('width', 0),
                        'height': info.get('height', 0),
                    }

    def send_error_response(self, code, message):
        """Send error response"""
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        error_data = {
            'success': False,
            'error': message
        }
        self.wfile.write(json.dumps(error_data).encode('utf-8'))
