<template>
    <div>
    <link rel="stylesheet" href="/css/dashboard.css">
    <div>
        <div class="dashboard-wrapper">
            <main class="dashboard-main">
                <header class="dashboard-header">
                    <!-- <h1>Welcome to Dashboard</h1>
                    <p>This is your admin panel. Add features here!</p> -->
                </header>
                <section class="dashboard-content">
                    <div class="row">
                        <div class="col-12 col-md-6 col-lg-4 mb-4">
                            <div class="card">
                                <h3>Quick Stats</h3>
                                <ul>
                                    <li>Users: {{ this.count }}</li>
                                    <li>Posts: 0</li>
                                    <li>Visits: 0</li>
                                </ul>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 col-lg-4 mb-4">
                            <div class="card chat-card">
                                <h3>💬 Chat Realtime</h3>
                                <p>Tham gia vào phòng chat để giao tiếp với mọi người</p>
                                <button @click="goToChat" class="btn-chat">
                                    Vào Chat
                                </button>
                            </div>
                        </div>
                        <div class="col-12 col-md-6 col-lg-4 mb-4">
                            <div class="card calendar-card">
                                <h3>📅 Quản lý Công việc & Thời gian</h3>
                                <p>Chọn ngày theo tháng để thêm và theo dõi todo list</p>
                                <button @click="goToCalendar" class="btn-calendar">
                                    Vào Calendar
                                </button>
                            </div>
                        </div>
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
    data() {
        return {
            count: 0,
        }
    },
    mounted(){
     this.loadUser();   
    },
    methods:{
        hand(){
            this.$router.push('/news')
        },
        goToChat() {
            this.$router.push('/chat')
        },
        goToCalendar() {
            this.$router.push('/calendar')
        },
       async loadUser() {
            try {
                this.count = await this.$axios.$get("/api/all");
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        },
    }
    
}
</script>
