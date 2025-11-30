from http.server import BaseHTTPRequestHandler
import json
import yt_dlp
import os
import tempfile
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
            
            # Get video info
            result = self.get_video_info(url, platform)
            
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
        elif 'douyin.com' in url_lower or 'iesdouyin.com' in url_lower:
            return 'douyin'
        elif 'tiktok.com' in url_lower:
            return 'tiktok'
        elif 'youtube.com' in url_lower or 'youtu.be' in url_lower:
            return 'youtube'
        else:
            return 'unknown'

    def _get_cookies_path(self, platform):
        """Get path to temporary cookie file if env var exists"""
        env_var_map = {
            'bilibili': 'COOKIES_BILIBILI',
            'douyin': 'COOKIES_DOUYIN',
            'youtube': 'COOKIES_YOUTUBE'
        }
        
        env_var = env_var_map.get(platform)
        if not env_var:
            return None
            
        cookies_content = os.environ.get(env_var)
        if not cookies_content:
            return None
            
        # Create temp file
        try:
            fd, path = tempfile.mkstemp(suffix='.txt', text=True)
            with os.fdopen(fd, 'w') as f:
                f.write(cookies_content)
            return path
        except Exception as e:
            print(f"Failed to create cookie file: {e}")
            return None

    def get_video_info(self, url, platform):
        """Get video info using yt-dlp with optimized settings"""
        
        # Base configuration
        ydl_opts = {
            'format': 'best[ext=mp4]/best',
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'socket_timeout': 10,
            'geo_bypass': True,
            'nocheckcertificate': True,
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            },
        }

        # Cookie handling
        cookie_path = self._get_cookies_path(platform)
        if cookie_path:
            ydl_opts['cookiefile'] = cookie_path

        # Platform specific optimizations
        if platform == 'bilibili':
            ydl_opts.update({
                'format': 'bestvideo+bestaudio/best',  # Allow separate streams
                'http_headers': {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    'Referer': 'https://www.bilibili.com/',
                },
            })
        
        elif platform == 'douyin':
            ydl_opts.update({
                'http_headers': {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36', # Mobile UA often works better
                    'Referer': 'https://www.douyin.com/',
                }
            })
            
        elif platform == 'youtube':
            ydl_opts.update({
                'format': 'best[ext=mp4][height<=1080]/best[ext=mp4]/best',
                'extractor_args': {
                    'youtube': {
                        'player_client': ['android', 'ios', 'web'], # Rotate clients
                        'skip': ['dash', 'hls'],
                    }
                }
            })

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                
            # Clean up cookie file
            if cookie_path and os.path.exists(cookie_path):
                try:
                    os.remove(cookie_path)
                except:
                    pass

            # Process results
            return self._process_info(info, platform)

        except Exception as e:
            # Clean up cookie file in case of error
            if cookie_path and os.path.exists(cookie_path):
                try:
                    os.remove(cookie_path)
                except:
                    pass
            
            error_msg = str(e)
            if 'Sign in to confirm your age' in error_msg:
                raise Exception('Video is age-restricted and requires login.')
            elif 'Video unavailable' in error_msg:
                raise Exception('Video is unavailable or deleted.')
            else:
                raise Exception(f'Download failed: {error_msg}')

    def _process_info(self, info, platform):
        """Process yt-dlp info dict into standard response"""
        
        # Basic info
        title = info.get('title', 'Unknown')
        thumbnail = info.get('thumbnail', '')
        duration = info.get('duration', 0)
        width = info.get('width', 0)
        height = info.get('height', 0)
        
        # Handle Bilibili separate streams
        if platform == 'bilibili':
            formats = info.get('formats', [])
            
            # Check for single file with audio
            single_mp4 = None
            for fmt in formats:
                if (fmt.get('ext') == 'mp4' and 
                    fmt.get('vcodec') != 'none' and 
                    fmt.get('acodec') != 'none'):
                    single_mp4 = fmt
                    break
            
            if not single_mp4:
                # Fallback to separate streams
                video_format = None
                audio_format = None
                
                v_formats = [f for f in formats if f.get('vcodec') != 'none' and f.get('acodec') == 'none']
                if v_formats:
                    video_format = max(v_formats, key=lambda f: f.get('height', 0) or 0)
                    
                a_formats = [f for f in formats if f.get('acodec') != 'none' and f.get('vcodec') == 'none']
                if a_formats:
                    audio_format = max(a_formats, key=lambda f: f.get('abr', 0) or 0)
                
                if video_format and audio_format:
                    return {
                        'success': True,
                        'platform': platform,
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
                        'note': 'Video and audio are separate streams.'
                    }

        # Standard processing for single file
        direct_url = info.get('url')
        
        # Try to find best mp4 if original url is not optimal
        if 'formats' in info:
            mp4_formats = [f for f in info['formats'] if f.get('ext') == 'mp4']
            if mp4_formats:
                best_format = max(mp4_formats, key=lambda f: f.get('height', 0) or 0)
                direct_url = best_format.get('url', direct_url)
                width = best_format.get('width', width)
                height = best_format.get('height', height)

        return {
            'success': True,
            'platform': platform,
            'title': title,
            'thumbnail': thumbnail,
            'duration': duration,
            'filesize': info.get('filesize') or info.get('filesize_approx', 0),
            'format': info.get('ext', 'mp4'),
            'download_type': 'single',
            'download_url': direct_url,
            'width': width,
            'height': height,
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
