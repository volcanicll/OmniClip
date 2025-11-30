# Cloudflare Worker Proxy Deployment

To support direct downloads from sites like Bilibili and Douyin that enforce Referer checks, you need to deploy a Cloudflare Worker proxy.

## 1. Create a Worker

1.  Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  Go to **Workers & Pages**.
3.  Click **Create Application** -> **Create Worker**.
4.  Name it (e.g., `video-download-proxy`).
5.  Click **Deploy**.

## 2. Update Code

1.  Click **Edit code**.
2.  Copy the content of `proxy/worker.js` from this project.
3.  Paste it into the Cloudflare editor (replacing the default code).
4.  Click **Save and Deploy**.

## 3. Usage

Your proxy will be available at `https://video-download-proxy.<your-subdomain>.workers.dev`.

### API Format

```
GET /?url=<VIDEO_URL>&referer=<REFERER_URL>&filename=<FILENAME>
```

-   `url`: The direct link to the video file (obtained from the backend API).
-   `referer`: The page URL to fake as the source (e.g., `https://www.bilibili.com`).
-   `filename`: (Optional) Desired filename for the download.

### Integration

In your frontend application, when a user clicks "Download":

1.  Construct the proxy URL:
    ```javascript
    const proxyUrl = `https://your-worker.dev/?url=${encodeURIComponent(videoUrl)}&referer=${encodeURIComponent(platformUrl)}&filename=${encodeURIComponent(title)}.mp4`;
    ```
2.  Open this `proxyUrl` in a new tab or window to trigger the download.
