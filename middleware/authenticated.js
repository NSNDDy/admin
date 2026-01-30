export default function ({ store, redirect, route }) {
  // Nếu chạy ở server side thì bỏ qua check localStorage (hoặc dùng cookie-parser nếu cần)
  if (process.server) return

  const token = localStorage.getItem('accessToken')
  const expiry = localStorage.getItem('tokenExpiry')
  const now = new Date().getTime()

  // Kiểm tra nếu token đã hết hạn
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
