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
            <div class="sidebar-header" v-if="isOpen">
                <h2>Menu</h2>
            </div>
            <ul class="sidebar-menu">
                <li>
                    <a href="/dashboard" @click="closeSidebar" :title="!isOpen ? 'Dashboard' : ''">
                        <i class="fas fa-home"></i>
                        <span v-show="isOpen" class="ml-2">Dashboard</span>
                    </a>
                </li>
                <li>
                    <a href="/finance" @click="closeSidebar" :title="!isOpen ? 'Finance' : ''">
                        <i class="fas fa-wallet"></i>
                        <span v-show="isOpen" class="ml-2">Finance</span>
                    </a>
                </li>
                <li>
                    <a href="/calendar" @click="closeSidebar" :title="!isOpen ? 'Calendar' : ''">
                        <i class="fas fa-calendar-alt"></i>
                        <span v-show="isOpen" class="ml-2">Calendar</span>
                    </a>
                </li>
                <li>
                    <a href="/body" @click="closeSidebar" :title="!isOpen ? 'Body' : ''">
                        <i class="fas fa-dumbbell"></i>
                        <span v-show="isOpen" class="ml-2">Body</span>
                    </a>
                </li>
                <li>
                    <a href="/chat" @click="closeSidebar" :title="!isOpen ? 'Chat' : ''">
                        <i class="fas fa-comments"></i>
                        <span v-show="isOpen" class="ml-2">Chat</span>
                    </a>
                </li>
                <li>
                    <a href="/news" @click="closeSidebar" :title="!isOpen ? 'News' : ''">
                        <i class="fas fa-newspaper"></i>
                        <span v-show="isOpen" class="ml-2">News</span>
                    </a>
                </li>
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
    left: 11px;
    top: 105px;
    z-index: 9999;
    background: none;
    backdrop-filter: none;
    border: none;
    padding: 12px;
    border-radius: 12px;
    cursor: pointer;
    flex-direction: column;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    /* box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); */
}

.sidebar-toggle:hover {
    background: rgba(15, 15, 23, 0.9);
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.2);
}

.sidebar-toggle.sidebar-open {
    left: 200px;
    background: none;
    border-color: none;
}

.sidebar-toggle.sidebar-open:hover {
    background: rgba(255, 255, 255, 0.2);
}

.toggle-icon {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.toggle-icon span {
    width: 24px;
    height: 2px;
    background: white;
    border-radius: 4px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-toggle:hover .toggle-icon span {
    background: #fff;
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

.toggle-icon.open span:nth-child(1) {
    transform: translateY(7px) rotate(-45deg);
    width: 14px;
    transform-origin: left center;
}

.toggle-icon.open span:nth-child(2) {
    width: 24px;
    opacity: 1;
}

.toggle-icon.open span:nth-child(3) {
    transform: translateY(-7px) rotate(45deg);
    width: 14px;
    transform-origin: left center;
}

.dashboard-sidebar {
    position: fixed;
    left: 0;
    top: 90px;
    width: 70px;
    height: calc(100vh - 60px);
    background: rgba(15, 15, 23, 0.92);
    backdrop-filter: blur(14px) saturate(1.15);
    color: white;
    padding: 70px 0 20px; /* Space for toggle button */
    overflow-y: auto;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 2px 0 24px rgba(0, 0, 0, 0.35);
    z-index: 998;
}

.dashboard-sidebar.open {
    width: 250px;
}

.sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    margin-bottom: 10px;
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
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px 0;
    color: #ecf0f1;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-left: 3px solid transparent;
    white-space: nowrap;
    overflow: hidden;
}

.dashboard-sidebar.open .sidebar-menu a {
    justify-content: flex-start;
    padding: 15px 20px;
}

.sidebar-menu a i {
    font-size: 1.2rem;
    width: 24px;
    text-align: center;
}

.sidebar-menu a:hover {
    background: rgba(255, 255, 255, 0.06);
    border-left-color: #667eea;
}

.dashboard-sidebar.open .sidebar-menu a:hover {
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
    .dashboard-sidebar {
        transform: translateX(-100%);
        width: 250px;
    }

    .dashboard-sidebar.open {
        transform: translateX(0);
    }

    .sidebar-toggle {
        left: 20px;
    }

    .sidebar-toggle.sidebar-open {
        left: 215px;
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
