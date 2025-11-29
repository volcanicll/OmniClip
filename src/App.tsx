import { useDownload } from './hooks/useDownload';
import { DownloadForm } from './components/DownloadForm';
import { VideoCard } from './components/VideoCard';
import './styles/index.css';

function App() {
    const { loading, error, videoInfo, fetchVideoInfo, reset } = useDownload();

    const handleSubmit = async (url: string) => {
        try {
            await fetchVideoInfo(url);
        } catch (err) {
            // Error is handled in the hook
            console.error('Download error:', err);
        }
    };

    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo">
                            <svg className="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            <h1 className="logo-text">视频下载工具</h1>
                        </div>
                        <p className="tagline">快速下载 X、抖音、B站 视频</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main">
                <div className="container">
                    {!videoInfo ? (
                        <div className="form-section">
                            <DownloadForm onSubmit={handleSubmit} loading={loading} />

                            {error && (
                                <div className="error-card">
                                    <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h3 className="error-title">解析失败</h3>
                                        <p className="error-message">{error}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="result-section">
                            <VideoCard videoInfo={videoInfo} onReset={reset} />
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p className="footer-text">
                        免费开源项目 · 使用 <a href="https://github.com/yt-dlp/yt-dlp" target="_blank" rel="noopener noreferrer" className="footer-link">yt-dlp</a> 提供支持
                    </p>
                    <p className="footer-disclaimer">
                        请遵守相关法律法规，尊重版权，仅下载您有权使用的内容
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;
