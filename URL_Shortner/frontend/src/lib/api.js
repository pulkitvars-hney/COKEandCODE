export const MAX_ACTIVE_URLS = 7

export const api = async (path, options = {}) => {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const fieldErrors = data.details?.fieldErrors || {}
    const fieldMessages = Object.values(fieldErrors).flat()
    const detailMessage = fieldMessages.length ? fieldMessages.join(' ') : data.message
    throw new Error(detailMessage || 'Something went wrong. Please try again.')
  }
  return data
}

export const getCurrentUser = async () => {
  try {
    const response = await api('/api/auth/me')
    return response.data.user
  } catch (error) {
    if (
      error.message === 'Unauthorized Request' ||
      error.message === 'Invalid or expired access token'
    ) {
      return null
    }
    throw error
  }
}

export const isActiveUrl = (url) => {
  if (!url?.expiresAt) return false
  return new Date(url.expiresAt).getTime() > Date.now()
}

export const countActiveUrls = (urls = []) => urls.filter(isActiveUrl).length
