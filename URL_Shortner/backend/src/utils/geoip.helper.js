const isPrivateIp = (ipAddress) => {
    const normalizedIp = ipAddress.replace(/^::ffff:/, "");

    return normalizedIp === "::1" || normalizedIp === "127.0.0.1"
        || normalizedIp.startsWith("10.")
        || normalizedIp.startsWith("192.168.")
        || /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalizedIp);
};

const getLocationFromIp = async (ipAddress) => {
    if (!ipAddress || isPrivateIp(ipAddress)) {
        return {};
    }

    try {
        const response = await fetch(
            `https://ipwho.is/${encodeURIComponent(ipAddress)}`,
            { signal: AbortSignal.timeout(2_000) }
        );
        const location = await response.json();

        if (!response.ok || !location.success) {
            return {};
        }

        return {
            country: location.country || undefined,
            city: location.city || undefined,
        };
    } catch {
        // GeoIP data is optional; an unavailable provider must not block redirects.
        return {};
    }
};

module.exports = { getLocationFromIp };
