/**
 * Video Download Proxy Worker
 * 
 * Proxies video requests with modified headers to bypass anti-hotlinking (Referer checks).
 * 
 * Usage:
 * https://your-worker.dev/?url=<video_url>&referer=<referer_url>&filename=<optional_name>
 */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Handle CORS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "*",
                },
            });
        }

        // Get parameters
        const targetUrl = url.searchParams.get("url");
        const referer = url.searchParams.get("referer");
        const filename = url.searchParams.get("filename") || "video.mp4";

        if (!targetUrl) {
            return new Response("Missing 'url' parameter", { status: 400 });
        }

        // Prepare headers for the upstream request
        const headers = new Headers();
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

        if (referer) {
            headers.set("Referer", referer);
        } else {
            // Auto-detect referer based on domain if not provided
            if (targetUrl.includes("bilibili") || targetUrl.includes("bilivideo")) {
                headers.set("Referer", "https://www.bilibili.com/");
            } else if (targetUrl.includes("douyin")) {
                headers.set("Referer", "https://www.douyin.com/");
            }
        }

        try {
            // Fetch the video content
            const response = await fetch(targetUrl, {
                headers: headers,
                method: "GET"
            });

            if (!response.ok) {
                return new Response(`Failed to fetch video: ${response.status} ${response.statusText}`, { status: response.status });
            }

            // Create response headers
            const responseHeaders = new Headers(response.headers);
            responseHeaders.set("Access-Control-Allow-Origin", "*");
            responseHeaders.set("Content-Disposition", `attachment; filename="${filename}"`);

            // Ensure we're sending the correct content type if possible, or fallback
            if (!responseHeaders.has("Content-Type")) {
                responseHeaders.set("Content-Type", "video/mp4");
            }

            // Return the stream
            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
            });

        } catch (error) {
            return new Response(`Proxy error: ${error.message}`, { status: 500 });
        }
    },
};
