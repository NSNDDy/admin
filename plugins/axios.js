export default function ({ $axios, redirect }) {
  const decodeJwtPayload = (token) => {
    if (!token) return null
    const parts = String(token).split('.')
    if (parts.length < 2) return null

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)

    try {
      return JSON.parse(atob(padded))
    } catch (e) {
      return null
    }
  }

  const getJwtExpiryMs = (token) => {
    const payload = decodeJwtPayload(token)
    if (!payload) return null
    if (typeof payload.exp !== 'number') return null
    return payload.exp * 1000
  }

  const clearAuthStorage = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    localStorage.removeItem('tokenExpiry')
  }

  const isTokenExpired = (token) => {
    const jwtExpiryMs = getJwtExpiryMs(token)
    if (jwtExpiryMs) return Date.now() >= jwtExpiryMs

    const expiry = localStorage.getItem('tokenExpiry')
    if (!expiry) return false
    const expiryMs = parseInt(expiry)
    if (Number.isNaN(expiryMs)) return false
    return Date.now() >= expiryMs
  }

  if (process.client) {
    const token = localStorage.getItem('accessToken')
    if (token && isTokenExpired(token)) {
      clearAuthStorage()
    }
  }

  $axios.onRequest(config => {
    if (process.client) {
      const token = localStorage.getItem('accessToken');
      if (token && isTokenExpired(token)) {
        clearAuthStorage()
      } else if (token) {
        const url = (config && config.url) ? String(config.url) : ''
        const isAuthEndpoint = url.includes('/api/auth/login') || url.includes('/api/auth/register')
        if (!isAuthEndpoint) {
          config.headers.common['accessToken'] = token;
        }
      }
    }
    console.log('Making request to ' + config.url);
  });

  $axios.onError(async error => {
    const config = error.config || {};
    const status = parseInt(error.response && error.response.status);
    const isRetryable = !error.response || status === 502 || status === 503 || status === 504;
    config.__retryCount = config.__retryCount || 0;
    if (isRetryable && config.__retryCount < 3) {
      config.__retryCount += 1;
      const delay = Math.pow(2, config.__retryCount) * 500;
      await new Promise(r => setTimeout(r, delay));
      return $axios.request(config);
    }
    const code = parseInt(error.response && error.response.status);
    if (code === 401) {
      if (process.client) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
      redirect('/login');
    }
  });
}
