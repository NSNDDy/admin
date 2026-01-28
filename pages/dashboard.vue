<template>
    <div>
    <link rel="stylesheet" href="/css/dashboard.css">
    <div>
        <div class="dashboard-wrapper">
            <main class="dashboard-main">
                <header class="dashboard-header">
                    <h1>Welcome to Dashboard</h1>
                    <p>This is your admin panel. Add features here!</p>
                </header>
                <section class="dashboard-content">
                    <div class="card">
                        <h3>Quick Stats</h3>
                        <ul>
                            <li>Users: 0</li>
                            <li>Posts: 0</li>
                            <li>Visits: 0</li>
                        </ul>
                    </div>
                    <div class="card chat-card">
                        <h3>💬 Chat Realtime</h3>
                        <p>Tham gia vào phòng chat để giao tiếp với mọi người</p>
                        <button @click="goToChat" class="btn-chat">
                            Vào Chat
                        </button>
                    </div>
                </section>
            </main>
        </div>
    </div>
    </div>
</template>

<script>

export default {
    name: 'DashboardPage',
    components:{},
    layout: 'listbase',
    middleware: 'authenticated',
    methods:{
        hand(){
            this.$router.push('/news')
        },
        goToChat() {
            this.$router.push('/chat')
        }
    }
}
</script>