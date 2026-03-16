export default function ({ store, redirect, route }) {
  // Nếu chạy ở server side thì bỏ qua check localStorage (hoặc dùng cookie-parser nếu cần)
  if (process.server) return

  const token = localStorage.getItem('accessToken')
  const expiry = localStorage.getItem('tokenExpiry')
  const now = new Date().getTime()

  const decodeJwtPayload = (raw) => {
    if (!raw) return null
    const parts = String(raw).split('.')
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

  const jwtExpiryMs = (() => {
    const payload = decodeJwtPayload(token)
    if (!payload) return null
    if (typeof payload.exp !== 'number') return null
    return payload.exp * 1000
  })()

  // Kiểm tra nếu token đã hết hạn
  if (token && jwtExpiryMs && now >= jwtExpiryMs) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    localStorage.removeItem('tokenExpiry')
    return redirect('/login')
  }

  if (token && expiry && now > parseInt(expiry)) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    localStorage.removeItem('tokenExpiry')
    return redirect('/login')
  }
  
  // Nếu chưa có token và đang cố vào trang cần bảo vệ
  if (!token && route.path !== '/login' && route.path !== '/register') {
    return redirect('/login')
  }

  // Nếu đã có token mà lại vào trang login/register
  if (token && (route.path === '/login' || route.path === '/register')) {
    return redirect('/dashboard') // Chuyển về Dashboard cho đồng bộ
  }
}
