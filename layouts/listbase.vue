<template>
    <div class="layout-wrapper">
        <Header />
        <div class="layout-container">
            <Aside />
            <div class="app-body list-base">
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

/* Responsive Design */
@media (max-width: 768px) {
    .app-body {
        padding-left: 0;
    }
}
</style>