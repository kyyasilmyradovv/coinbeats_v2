// client/src/utils/extractYouTubeVideoId.ts

export const extractYouTubeVideoId = (url: string): string | null => {
    try {
        const parsedUrl = new URL(url)
        const hostname = parsedUrl.hostname.toLowerCase()

        if (hostname.includes('youtube.com')) {
            if (parsedUrl.pathname.startsWith('/watch')) {
                // Standard YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
                return parsedUrl.searchParams.get('v')
            } else if (parsedUrl.pathname.startsWith('/shorts')) {
                // YouTube Shorts URL: https://www.youtube.com/shorts/VIDEO_ID
                return parsedUrl.pathname.split('/')[2]
            } else if (parsedUrl.pathname.startsWith('/embed')) {
                // Embedded YouTube URL: https://www.youtube.com/embed/VIDEO_ID
                return parsedUrl.pathname.split('/')[2]
            }
        } else if (hostname.includes('youtu.be')) {
            // Shortened YouTube URL: https://youtu.be/VIDEO_ID
            return parsedUrl.pathname.slice(1)
        }

        return null
    } catch (error) {
        console.error('Invalid YouTube URL:', url)
        return null
    }
}
