<template>
    <div class="layout-wrapper">
        <Header />
        <div class="layout-container">
            <Aside :isOpen="sidebarOpen" @toggle="toggleSidebar" @close="closeSidebar" />
            <div class="app-body list-base" :class="{ 'sidebar-closed': !sidebarOpen }">
                <nuxt />
            </div>
        </div>
        <Footer />
    </div>
</template>
<script>
import Header from '~/components/Header'
import Footer from '~/components/Footer'
import Aside from '~/components/Aside';
export default {
    components: {
        Header,
        Footer,
        Aside
    },
    data() {
        return {
            sidebarOpen: true
        }
    },
    mounted() {
        this.checkScreen();
        window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        checkScreen() {
            if (window.innerWidth <= 768) {
                this.sidebarOpen = false;
            } else {
                this.sidebarOpen = true;
            }
        },
        handleResize() {
            // Optional: Auto-collapse on resize to mobile
            if (window.innerWidth <= 768 && this.sidebarOpen) {
                this.sidebarOpen = false;
            }
            // Optional: Auto-expand on resize to desktop? Maybe not.
            if (window.innerWidth > 768 && !this.sidebarOpen) {
                 // Keep user preference or auto-open? 
                 // Usually auto-open is nice.
                 this.sidebarOpen = true;
            }
        },
        toggleSidebar() {
            this.sidebarOpen = !this.sidebarOpen;
        },
        closeSidebar() {
            this.sidebarOpen = false;
        }
    }

}
</script>

<style scoped>
.layout-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.layout-container {
    display: flex;
    flex: 1;
}

.app-body {
    flex: 1;
    padding-left: 250px;
    transition: padding-left 0.3s ease;
}

.app-body.sidebar-closed {
    padding-left: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
    .app-body {
        padding-left: 0;
    }
}
</style>