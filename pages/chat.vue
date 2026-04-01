<template>
    <div class="chat-page">
    <div class="chat-container">
        <div class="chat-sidebar">
            <div class="sidebar-header">
                <h3>Người dùng</h3>
            </div>
            <div class="user-list">
                <div class="user-item" :class="{ active: roomId === 'general' }" @click="switchRoom('general')">
                    <div class="user-info">
                        <span class="username">Phòng chung</span>
                        <span class="status-indicator online"></span>
                    </div>
                </div>
                <div v-for="user in otherUsers" :key="user.id" 
                    class="user-item" 
                    :class="{ active: isCurrentPrivateRoom(user) }"
                    @click="switchPrivateRoom(user)">
                    <div class="user-avatar">
                        <img :src="user.avatar || 'https://via.placeholder.com/40'" alt="avatar">
                    </div>
                    <div class="user-info">
                        <span class="username">{{ user.username }}</span>
                        <div class="user-meta">
                            <span v-if="user.hasNewMessage" class="unread-dot"></span>
                            <span class="status-indicator" :class="{ online: user.isOnline }"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="chat-wrapper">
            <div class="chat-header">
                <div class="chat-header-title">
                    <h2>{{ chatTitle }}</h2>
                    <div class="d-flex align-items-center gap-2">
                        <p class="status m-0" :class="{ online: isConnected }">
                            {{ isConnected ? '🟢 Online' : '🔴 Offline' }}
                        </p>
                        <button @click="toggleMute" class="btn-mute" :title="isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'">
                            <i class="fas" :class="isMuted ? 'fa-volume-mute' : 'fa-volume-up'"></i>
                        </button>
                    </div>
                </div>
                <button @click="goBack" class="btn-back">← Quay lại</button>
            </div>

            <div class="chat-messages" ref="messagesContainer">
                <div v-if="messages.length === 0" class="empty-chat">
                    <p>Không có tin nhắn nào. Bắt đầu cuộc trò chuyện!</p>
                </div>
                <div v-for="(message, index) in messages" :key="index"
                    :class="['message', isMyMessage(message) ? 'own' : 'other']">
                    <div class="message-info">
                        <span class="username">{{ message.sender.username }}</span>
                        <span class="time">{{ formatTime(message.timestamp || message.createdAt) }}</span>
                    </div>
                    <div class="message-content">
                        {{ message.content }}
                    </div>
                </div>
            </div>

            <div class="chat-input-area">
                <div class="input-wrapper">
                    <input v-model="newMessage" @keydown.enter.prevent="sendMessage"
                        type="text" class="chat-input" placeholder="Nhập tin nhắn..." :disabled="!isConnected">
                    <button @click="sendMessage" class="btn-send" :disabled="!isConnected || !newMessage.trim()">
                        Gửi
                    </button>
                </div>
                <div v-if="!isConnected" class="offline-notice">
                    ⚠️ Đang kết nối tới máy chủ...
                </div>
            </div>
        </div>
    </div>
    </div>
</template>

<script>
export default {
    name: 'ChatPage',
    layout: 'default',
    middleware: 'authenticated', // Bắt buộc phải login mới vào được
    data() {
        return {
            socket: null,
            newMessage: '',
            messages: [],
            currentUser: null,
            otherUsers: [],
            roomId: this.$route.query.roomId || 'general',
            selectedUser: null,
            isLoadingHistory: false,
            page: 0,
            isMuted: false
        }
    },
    computed: {
        isConnected() {
            return this.$notifier && this.$notifier.state.isConnected;
        },
        chatTitle() {
            if (this.roomId === 'general') return 'Phòng chung';
            return this.selectedUser ? `Chat với: ${this.selectedUser.username}` : 'Đang tải...';
        }
    },
    mounted() {
        this.loadUser();
        this.fetchUsers();
        this.messages = [];
        this.initializeChat();
        this.$notifier.setActiveRoom(this.roomId);
    },
    beforeDestroy() {
        this.$notifier.setActiveRoom(null);
        if (this.socket) {
            this.socket.off('connect', this.onSocketConnect);
            this.socket.off('disconnect', this.onSocketDisconnect);
            this.socket.off('receive_message', this.onReceiveMessage);
            this.socket.off('private_notification', this.onPrivateNotification);
        }
    },
    watch: {
        roomId(newRoomId) {
            this.$notifier.setActiveRoom(newRoomId);
        }
    },
    methods: {
        loadUser() {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    this.currentUser = JSON.parse(userStr);
                }
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        },
        async fetchUsers() {
            try {
                const res = await this.$api.chat.getUsers();
                if (this.currentUser) {
                    this.otherUsers = res.filter(u => u.id !== this.currentUser.id);
                } else {
                    this.otherUsers = res;
                }

                // Nếu có roomId từ query (do nhấn thông báo), tự động tìm và set selectedUser
                if (this.$route.query.roomId && this.$route.query.roomId.startsWith('private_')) {
                    const parts = this.$route.query.roomId.split('_');
                    const otherId = parts.find(id => id != this.currentUser.id && id !== 'private');
                    if (otherId) {
                        const targetUser = this.otherUsers.find(u => u.id == otherId);
                        if (targetUser) {
                            this.selectedUser = targetUser;
                        }
                    }
                }
            } catch (e) {
                console.error("Error fetching users", e);
            }
        },
        switchRoom(roomId) {
            if (this.roomId === roomId) return;
            this.roomId = roomId;
            this.selectedUser = null;
            this.messages = [];
            this.socket.emit('join_room', { roomId: this.roomId });
            this.fetchChatHistory();
        },
        switchPrivateRoom(user) {
            const privateRoomId = this.getPrivateRoomId(this.currentUser.id, user.id);
            if (this.roomId === privateRoomId) return;
            this.roomId = privateRoomId;
            this.selectedUser = user;
            this.$set(user, 'hasNewMessage', false);
            this.messages = [];
            this.socket.emit('join_room', { roomId: this.roomId });
            this.fetchChatHistory();
        },
        getPrivateRoomId(id1, id2) {
            const sortedIds = [id1, id2].sort((a, b) => a - b);
            return `private_${sortedIds[0]}_${sortedIds[1]}`;
        },
        isCurrentPrivateRoom(user) {
            if (!this.currentUser) return false;
            return this.roomId === this.getPrivateRoomId(this.currentUser.id, user.id);
        },
        toggleMute() {
            this.isMuted = !this.isMuted;
            if (this.$notifier && this.$notifier.state.notificationSound) {
                this.$notifier.state.notificationSound.muted = this.isMuted;
                // Play a tiny silent sound to "unlock" audio on first click
                if (!this.isMuted) {
                    this.$notifier.state.notificationSound.play().catch(() => {});
                }
            }
        },
        onSocketConnect() {
            console.log('Chat Page: Socket connected, joining room:', this.roomId);
            this.socket.emit('join_room', { roomId: this.roomId });
            this.fetchChatHistory();
        },
        onSocketDisconnect() {
            // isConnected updated via computed
        },
        onReceiveMessage(message) {
            console.log('Chat Page: Received message in room:', message.roomId, 'Current room:', this.roomId);
            if (message.roomId === this.roomId) {
                const exists = this.messages.some(m => m.id === message.id);
                if (!exists) {
                    this.messages.push(message);
                    this.$nextTick(() => {
                        this.scrollToBottom();
                    });
                }
            }
        },
        onPrivateNotification(message) {
            console.log('Chat Page: Received private notification for room:', message.roomId);
            const user = this.otherUsers.find(u => u.id === message.sender.id);
            if (user) {
                this.$set(user, 'hasNewMessage', true);
            }
            
            if (message.roomId === this.roomId) {
                const exists = this.messages.some(m => m.id === message.id);
                if (!exists) {
                    console.log('Chat Page: Pushing private message to current view');
                    this.messages.push(message);
                    this.$nextTick(() => {
                        this.scrollToBottom();
                    });
                }
            }
        },
        initializeChat() {
            console.log('Initializing chat with user:', this.currentUser?.username);
            this.socket = this.$notifier.state.socket;
            if (!this.socket) {
                this.$notifier.initSocket();
                this.socket = this.$notifier.state.socket;
            }

            if (this.socket) {
                // Clean up previous to avoid duplicates
                this.socket.off('connect', this.onSocketConnect);
                this.socket.off('disconnect', this.onSocketDisconnect);
                this.socket.off('receive_message', this.onReceiveMessage);
                this.socket.off('private_notification', this.onPrivateNotification);

                this.socket.on('connect', this.onSocketConnect);
                this.socket.on('disconnect', this.onSocketDisconnect);
                this.socket.on('receive_message', this.onReceiveMessage);
                this.socket.on('private_notification', this.onPrivateNotification);

                if (this.isConnected) {
                    this.onSocketConnect();
                }
            }
        },
        sendMessage() {
            if (!this.newMessage.trim() || !this.isConnected) return;
            // Gửi tin nhắn lên Server
            this.socket.emit('send_message', {
                roomId: this.roomId,
                content: this.newMessage,
                type: 'TEXT'
            });

            this.newMessage = '';
        },
        isMyMessage(message) {
            return this.currentUser && message.sender.id === this.currentUser.id;
        },
        formatTime(timestamp) {
            const value = timestamp || null;
            if (!value) return '';
            return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs.messagesContainer;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            });
        },
        goBack() {
            this.$router.push('/dashboard')
        },

        async joinRoom() {
            if (!this.username || !this.roomId) return;
            
        }
        ,
        async fetchChatHistory() {
            if (this.isLoadingHistory) return;
            this.isLoadingHistory = true;
            const currentRoomId = this.roomId;
            try {
                const res = await this.$api.chat.getHistory(this.roomId);
                // Only update if we are still in the same room
                if (currentRoomId === this.roomId) {
                    // Merge existing new messages with history
                    const history = res.data || [];
                    const newMessages = this.messages.filter(m => !history.some(h => h.id === m.id));
                    this.messages = [...history, ...newMessages];
                    
                    this.$nextTick(() => {
                        this.scrollToBottom();
                    });
                }
            } catch (e) {
                console.error("Error fetching chat history", e);
            } finally {
                this.isLoadingHistory = false;
            }
        }
        
    }
}
</script>

