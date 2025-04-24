import { v2 as cloudinary } from 'cloudinary'

// Cloudinary constants
const CLOUD_NAME = 'dcbyqt0at'

// Configure Cloudinary
cloudinary.config({
    cloud_name: CLOUD_NAME,
    secure: true // Force HTTPS
})

/**
 * Generate a Cloudinary URL for proxying external images
 */
export function getProxiedImageUrl(imageUrl?: string) {
    if (!imageUrl) return '/placeholder-image.jpg'

    // If it's an HTTP URL from your server, proxy it through Cloudinary
    if (imageUrl.includes('http://telegram.coinbeats.xyz:5000')) {
        // Manually construct the Cloudinary fetch URL
        const encodedUrl = encodeURIComponent(imageUrl)
        return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_auto/${encodedUrl}`
    }

    // Return the original URL for images that don't need proxying
    return imageUrl
}
