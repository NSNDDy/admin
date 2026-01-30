<template>
    <div>
        <button class="sidebar-toggle" :class="{ 'sidebar-open': isOpen }" @click="toggleSidebar" :title="isOpen ? 'Đóng thanh bên' : 'Mở thanh bên'">
            <span class="toggle-icon" :class="{ open: isOpen }">
                <span></span>
                <span></span>
                <span></span>
            </span>
        </button>
        <aside class="dashboard-sidebar" :class="{ open: isOpen }">
            <div class="sidebar-header">
                <h2>Menu</h2>
                <button class="close-btn" @click="toggleSidebar">✕</button>
            </div>
            <ul class="sidebar-menu">
                <li><a href="/dashboard" @click="closeSidebar">Dashboard</a></li>
                <li><a href="/body" @click="closeSidebar">Body</a></li>
                <li><a href="/chat" @click="closeSidebar">Chat</a></li>
                <li><a href="/news" @click="closeSidebar">News</a></li>
                <li><a href="/test" @click="closeSidebar">Test</a></li>
            </ul>
        </aside>
        <div class="sidebar-overlay" v-if="isOpen" @click="toggleSidebar"></div>
    </div>
</template>

<script>
export default {
    name: 'Aside',
    props: {
        isOpen: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        toggleSidebar() {
            this.$emit('toggle');
        },
        closeSidebar() {
            this.$emit('close');
        }
    }
}
</script>

<style scoped>
.sidebar-toggle {
    display: flex;
    position: fixed;
    left: 20px;
    top: 90px;
    z-index: 9999;
    background: none;
    border: none;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    flex-direction: column;
    transition: left 0.3s ease;
}

.sidebar-toggle.sidebar-open {
    left: 205px;
}

.toggle-icon {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.toggle-icon span {
    width: 25px;
    height: 3px;
    background: #2c3e50; 
    background: #333;
    border-radius: 2px;
    transition: all 0.3s ease;
}

.sidebar-toggle.sidebar-open .toggle-icon span {
    background: white; /* On dark sidebar */
}

.toggle-icon.open span:nth-child(1) {
    transform: rotate(45deg) translate(10px, 10px);
}

.toggle-icon.open span:nth-child(2) {
    opacity: 0;
}

.toggle-icon.open span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -7px);
}

.dashboard-sidebar {
    position: fixed;
    left: 0;
    top: 90px;
    width: 250px;
    height: calc(100vh - 60px);
    background: #2c3e50;
    color: white;
    padding: 20px 0;
    overflow-y: auto;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    z-index: 998;
    transform: translateX(-100%);
}

.dashboard-sidebar.open {
    transform: translateX(0);
}

.sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px 20px;
    border-bottom: 1px solid #34495e;
}

.sidebar-header h2 {
    margin: 0;
    font-size: 1.5rem;
}

.close-btn {
    display: none;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
}

.sidebar-menu {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar-menu li {
    margin: 0;
}

.sidebar-menu a {
    display: block;
    padding: 15px 20px;
    color: #ecf0f1;
    text-decoration: none;
    transition: all 0.3s ease;
    border-left: 3px solid transparent;
}

.sidebar-menu a:hover {
    background: #34495e;
    border-left-color: #007bff;
    padding-left: 25px;
}

.sidebar-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 997;
}

/* Mobile */
@media (max-width: 768px) {
    .sidebar-toggle {
        display: flex;
    }
    
    .sidebar-overlay {
        display: block;
    }

    .close-btn {
        display: block;
    }
}

/* Desktop */
@media (min-width: 769px) {
    .sidebar-overlay {
        display: none !important;
    }

    .close-btn {
        display: none !important;
    }

}
</style>