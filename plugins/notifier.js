import Vue from 'vue';
import io from 'socket.io-client';

export default (context, inject) => {
    // 1. Reactive State for Notifications
    const state = Vue.observable({
        isConnected: false,
        socket: null,
        toasts: [],
        notificationSound: null,
        activeRoomId: null
    });

    // 2. Initialize Logic (Client-side only)
    if (process.client) {
        let socketUrl = context.env.SOCKET_URL || '';
        if (!socketUrl) {
            socketUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
        }
        console.log('Connecting to Global Socket.IO at:', socketUrl);
        
        // Initialize Sound - Use a more reliable sound URL
        state.notificationSound = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3');
        state.notificationSound.load();

        const requestBrowserPermission = () => {
            if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        };

        const initSocket = () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.warn('Notifier: No access token found');
                if (state.socket) state.socket.disconnect();
                return;
            }

            // If already connected, check if we need to reconnect (token change)
            if (state.socket && state.socket.connected) {
                // Check if the current socket token matches the stored token
                const currentToken = state.socket.io.opts.query.token;
                if (currentToken === token) {
                    console.log('Notifier: Socket already active with correct token, skipping init');
                    return;
                } else {
                    console.log('Notifier: Token changed, reconnecting socket...');
                    state.socket.disconnect();
                }
            }

            requestBrowserPermission();

            if (state.socket) {
                state.socket.removeAllListeners();
                state.socket.disconnect();
            }

            console.log('Notifier: Initializing new socket connection...');
            state.socket = io(socketUrl, {
                query: { token },
                transports: ['websocket', 'polling'],
                path: '/socket.io',
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 2000
            });

            state.socket.on('connect', () => {
                state.isConnected = true;
                console.log('Notifier: Global Socket Connected!', state.socket.id);
                state.socket.emit('join_room', { roomId: 'general' });
            });

            // If already connected, ensure we are in general room
            if (state.socket.connected) {
                state.isConnected = true;
                state.socket.emit('join_room', { roomId: 'general' });
            }

            state.socket.on('disconnect', (reason) => {
                state.isConnected = false;
                console.log('Notifier: Global Socket Disconnected:', reason);
            });

            state.socket.on('connect_error', (err) => {
                console.error('Notifier: Connection Error:', err.message);
            });

            // Handle Private Notifications
            state.socket.on('private_notification', (message) => {
                console.log('Notifier: RAW Private notification received:', message);
                // Only show toast if user is not currently in that specific private room
                if (state.activeRoomId !== message.roomId) {
                    console.log('Notifier: Condition met, showing notification');
                    showNotification(message);
                } else {
                    console.log('Notifier: User is in active room (' + state.activeRoomId + '), skipping toast');
                }
            });

            // Handle General Messages
            state.socket.on('receive_message', (message) => {
                console.log('Notifier: RAW General message received:', message);
                if (message.roomId === 'general') {
                    if (state.activeRoomId !== 'general') {
                        const userStr = localStorage.getItem('user');
                        let isMe = false;
                        if (userStr) {
                            try {
                                const me = JSON.parse(userStr);
                                isMe = me.id === message.sender.id;
                            } catch (e) {}
                        }

                        if (!isMe) {
                            console.log('Notifier: General message condition met, showing notification');
                            showNotification(message);
                        }
                    }
                }
            });
        };

        const showNotification = (message) => {
            console.log('Notifier: showNotification CALLED', message);
            
            // 1. Play Sound
            if (state.notificationSound) {
                state.notificationSound.currentTime = 0;
                state.notificationSound.play().catch(e => console.warn('Notifier: Play failed', e));
            }

            // 2. Add Toast
            const toastId = Date.now();
            state.toasts.push({
                id: toastId,
                ...message
            });
            console.log('Notifier: Toast added, count:', state.toasts.length);

            // Auto remove
            setTimeout(() => removeToast(toastId), 8000);

            // 3. Browser Notification
            if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(`Tin nhắn từ ${message.sender.username}`, {
                    body: message.content
                });
            }
        };

        const removeToast = (id) => {
            const index = state.toasts.findIndex(t => t.id === id);
            if (index !== -1) {
                state.toasts.splice(index, 1);
                console.log('Notifier: Removed toast', id, 'Remaining:', state.toasts.length);
            }
        };

        // Initial connection
        initSocket();

        // Expose functions to inject
        const notifier = {
            state,
            initSocket,
            removeToast,
            setActiveRoom(roomId) {
                state.activeRoomId = roomId;
            },
            requestBrowserPermission,
            handleToastClick(toast) {
                removeToast(toast.id);
                // Navigate to chat with roomId as query parameter
                context.app.router.push({
                    path: '/chat',
                    query: { roomId: toast.roomId }
                });
            }
        };

        inject('notifier', notifier);
    } else {
        // Fallback for SSR
        inject('notifier', { state: { toasts: [] } });
    }
};
