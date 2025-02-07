// 🔑 Define Public Key for RSA Encryption
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsEWbrAoE1hxJjDx35p5l
lwux5Nc3vybDqUlcarDLWhwtezVC63zQoE02bd5c0gccuhx7CPBnkRL0r4FpuuYX
SizKQCMQeiWY2+M+rGEC78rWHtqA5aJqGQWUFEIhBhEKKq5nHNtbs0NFYiNfH9gL
WQPN37GL5RJx8bvP12p1GFnUK9rRZbGpF4s0GWqcHU5cF6Ybo2qV5oeY2E9ysg97
dN8cMQncbuizmDP+DiKkQyBnQbD+//XN/oIkQ57wznk3fhdFuPoMfJ1Vxquec5d0
Qxg3vfjt+PjaFt5BTRx9flAqmK+6GdIcPH0FCieo5IG3TfvYv+jCzqPjyvvwbBQc
9wIDAQAB
-----END PUBLIC KEY-----`

// 📌 Convert PEM to CryptoKey
async function importPublicKey() {
    const pem = PUBLIC_KEY_PEM.replace(/-----.*?-----/g, '').replace(/\n/g, '') // Remove header/footer
    const binaryDer = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0))
    return await window.crypto.subtle.importKey('spki', binaryDer, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'])
}

// 🔑 Generate AES Key (256-bit)
async function generateAESKey() {
    const key = await window.crypto.subtle.generateKey({ name: 'AES-CBC', length: 256 }, true, ['encrypt', 'decrypt'])
    return key
}

// 🔒 Encrypt AES Key using RSA
async function encryptAESKey(aesKey) {
    const keyBuffer = await window.crypto.subtle.exportKey('raw', aesKey)
    const publicKey = await importPublicKey()
    const encryptedKey = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, keyBuffer)
    return btoa(String.fromCharCode(...new Uint8Array(encryptedKey))) // Convert to base64
}

// 🔓 Decrypt AES Key using RSA
async function decryptAESKey(encryptedAESKey) {
    const encryptedKeyBuffer = Uint8Array.from(atob(encryptedAESKey), (c) => c.charCodeAt(0))
    const privateKey = await importPrivateKey()
    const decryptedKeyBuffer = await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, encryptedKeyBuffer)
    return await window.crypto.subtle.importKey('raw', decryptedKeyBuffer, { name: 'AES-CBC' }, true, ['encrypt', 'decrypt'])
}

// 🔒 Encrypt Data using AES
async function encryptData(data, aesKey) {
    const iv = window.crypto.getRandomValues(new Uint8Array(16))
    const encoder = new TextEncoder()
    const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-CBC', iv }, aesKey, encoder.encode(data))
    return `${btoa(String.fromCharCode(...iv))}:${btoa(String.fromCharCode(...new Uint8Array(encrypted)))}`
}

// 🔓 Decrypt Data using AES
async function decryptData(encryptedData, aesKey) {
    const [ivBase64, encryptedBase64] = encryptedData.split(':')
    const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0))
    const encrypted = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0))

    const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-CBC', iv }, aesKey, encrypted)

    return new TextDecoder().decode(decrypted)
}

export { generateAESKey, encryptAESKey, encryptData, decryptData, decryptAESKey }
