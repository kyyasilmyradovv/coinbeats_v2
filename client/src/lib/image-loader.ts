const CLOUD_NAME = 'dcbyqt0at'

export default function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
    // Only proxy images from our HTTP server through Cloudinary
    if (src.includes('http://telegram.coinbeats.xyz:5000')) {
        const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`]
        const paramsString = params.join(',')
        return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${paramsString}/${encodeURIComponent(src)}`
    }

    // Return other images as-is
    return src
}
