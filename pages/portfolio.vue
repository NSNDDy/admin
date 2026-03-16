<template>
    <div id="figma-portfolio">
        <main class="position-relative overflow-hidden">
            <header class="fp-header fixed-top">
                <div class="container d-flex align-items-center justify-content-between" style="height: 64px">
                    <div class="d-flex align-items-center" style="gap: 12px">
                        <img :src="base + '/logo/logo3.svg'" alt="Logo"
                            style="width: 125px; height: 80px; object-fit: contain" />
                    </div>
                    <nav class="fp-nav d-none d-md-flex align-items-center" style="gap: 24px">
                        <a href="#hero">Home</a>
                        <a href="#about">About</a>
                        <a href="#projects">Lab</a>
                    </nav>
                </div>
            </header>

            <section id="hero" class="fp-hero">
                <div class="container mx-auto max-w-6xl">
                    <div class="d-flex flex-column flex-lg-row align-items-center">
                        <!-- IMG me -->
                        <div
                            class="d-flex justify-content-center justify-content-lg-end position-relative w-max w-lg-auto">
                            <div class="position-relative mt-4">
                                <img :src="base + '/assets/me.png'" alt="Profile" width="340" height="340"
                                    class="img-fluid position-absolute" style="max-width: 340px; height: auto" />
                                <img :src="base + '/assets/me-glow.png'" alt="Glow" width="340" height="340"
                                    class="img-fluid" style="max-width: 340px; height: auto" />
                            </div>
                        </div>
                        <!--  INTRO -->
                        <div class="col-lg-6 mt-5 mt-lg-0">
                            <div class="text-center text-lg-left">
                                <div class="d-none d-lg-inline-block position-relative mb-3">
                                    <img :src="base + '/assets/arrow.png'" alt="Arrow" class="position-absolute"
                                        style="left: -72px; top: -34px; width: 86px; height: auto" />
                                    <div style="position: relative; bottom: 6px">
                                        <p class="mb-0" style="color: #fff; font-size: 18px">
                                            Hello! I Am <span style="color: #a78bfa">Neyyud</span>
                                        </p>
                                    </div>
                                    <div class="position-absolute"
                                        style="bottom: -8px; left: 32px; width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid rgba(255,255,255,.1)" />
                                </div>

                                <div>
                                    <p class="fp-hero-subtitle mb-1">A Designer who</p>
                                    <h1 class="fp-hero-title">
                                        Judges a book<br />
                                        by its
                                        <span class="fp-cover-wrap">
                                            <img :src="base + '/assets/circle.png'" alt="Circle"
                                                class="fp-cover-circle" />
                                            <span class="fp-gradient-text">cover</span>
                                        </span>
                                        ...
                                    </h1>
                                    <p class="mt-2 mb-0" style="color: rgba(255, 255, 255, 0.8)">Because if the cover
                                        does not impress you what else can?</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- INTRO 2 -->
                    <div class="space-y-3 pt-15 text-center lg:text-left">
                        <div class="pt-4 w-100 text-center text-lg-left">
                            <p class="fp-typing">
                                I'm a {{ displayedText }}<span class="fp-cursor">|</span>
                            </p>
                            <p class="mt-2 mb-0" style="font-size: 20px; color: rgba(255, 255, 255, 0.9)">
                                <span>Currently, I'm a Web Developer</span>
                                <span class="d-inline-flex align-items-center ml-2" style="gap: 8px">
                                    <img :src="base + '/assets/logo.png'" alt="WebHR" width="20" height="20"
                                        style="width: 20px; height: 20px"></img>
                                    <a style="color: #60a5fa; font-weight: 600" href="https://syn-gr.com/">SYN</a>
                                    <!-- <span style="color: #60a5fa; font-weight: 600">WebHR,</span> -->
                                </span>
                            </p>
                            <p class="mt-4 mb-0"
                                style="font-size: 18px; color: rgba(255, 255, 255, 0.8); max-width: 560px">
                                I have two years of experience as a Web Developer, working with Spring Boot, Laravel,
                                and Vue.js to build scalable backend services and dynamic frontend interfaces. I am
                                skilled in API integration, cloud deployment, and performance optimization, with a focus
                                on delivering user-friendly and reliable web applications.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            <section id="experience" class="py-5">
                <div class="container">
                    <h2 class="text-center font-weight-bold fp-section-title">Work Experience</h2>
                    <div class="row mt-4">
                        <div v-for="card in experienceCards" :key="card.id" class="col-md-6 mt-4">
                            <div class="fp-card d-flex align-items-start">
                                <img :src="card.icon" :alt="card.title"
                                    style="width: 64px; height: 64px; object-fit: contain; flex: 0 0 auto" />
                                <div class="ml-4">
                                    <h3 class="h5 mb-2 text-white font-weight-bold">{{ card.title }}</h3>
                                    <p class="mb-2" style="color: rgba(255, 255, 255, 0.7); font-size: 14px">{{
                                        card.description }}</p>
                                    <a :href="card.href" target="_blank" rel="noopener noreferrer"
                                        class="fp-learn-more">LEARN MORE →</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="about" class="fp-about">
                <div class="container text-center">
                    <p class="mb-1 fp-about-title">
                        I'm currently looking to join a <span class="fp-gradient-text">cross-functional team</span>
                    </p>
                    <p class="mb-0 fp-about-subtitle">that values improving people's lives through accessible design</p>

                    <div class="fp-about-visual-wrap">
                        <img :src="base + '/assets/illustration.png'" alt="About illustration"
                            class="fp-about-visual img-fluid" />
                    </div>
                </div>
            </section>

            <section id="projects" class="py-4">
                <div class="container">
                    <div v-for="(project, index) in featuredProjects" :key="project.id" class="fp-featured-item"
                        :class="index % 2 === 1 ? 'fp-featured-right' : 'fp-featured-left'">
                        <div class="row align-items-center">
                            <div class="col-lg-5" :class="index % 2 === 1 ? 'order-lg-2' : 'order-lg-1'">
                                <div class="fp-featured-text">
                                    <div class="fp-featured-label">Featured Project</div>
                                    <h3 class="fp-featured-title">{{ project.title }}</h3>
                                    <div class="fp-featured-desc">
                                        <p class="mb-0">{{ project.description }}</p>
                                    </div>
                                    <a :href="project.href" target="_blank" rel="noopener noreferrer"
                                        class="fp-featured-icon" aria-label="Open project link">
                                        <i class="bi bi-globe"></i>
                                    </a>
                                </div>
                            </div>

                            <div class="col-lg-7 mt-4 mt-lg-0" :class="index % 2 === 1 ? 'order-lg-1' : 'order-lg-2'">
                                <a :href="project.href" target="_blank" rel="noopener noreferrer"
                                    class="d-block fp-featured-image-link">
                                    <div class="fp-featured-image-frame">
                                        <img :src="project.image" :alt="project.title" class="fp-featured-image" />
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="contact" class="fp-contact">
                <div class="container text-center">
                    <h2 class="font-weight-bold fp-section-title">Contact</h2>
                    <p class="fp-contact-copy mx-auto">
                        I'm currently looking to join a cross-functional team that values improving people's
                        lives through accessible design, or have a project in mind? Let's connect.
                    </p>
                    <p class="mb-3">
                        <a :href="'mailto:' + contactEmail" class="fp-contact-email">{{ contactEmail }}</a>
                    </p>
                    <div class="d-flex justify-content-center" style="gap: 12px">
                        <a :href="social.github" target="_blank" rel="noopener noreferrer" class="fp-social-icon"
                            aria-label="GitHub">
                            <i class="bi bi-github"></i>
                        </a>
                        <a :href="social.instagram" target="_blank" rel="noopener noreferrer" class="fp-social-icon"
                            aria-label="Instagram">
                            <i class="bi bi-instagram"></i>
                        </a>
                        <a :href="social.linkedin" target="_blank" rel="noopener noreferrer" class="fp-social-icon"
                            aria-label="LinkedIn">
                            <i class="bi bi-linkedin"></i>
                        </a>
                    </div>
                </div>
            </section>

            <footer class="py-4" style="border-top: 1px solid rgba(255, 255, 255, 0.1)">
                <div class="container d-flex flex-column align-items-center justify-content-between"
                    style="gap: 12px; color: rgba(255, 255, 255, 0.6); font-size: 14px">
                    <span>© {{ new Date().getFullYear() }}Portfolio (Nuxt 2 route)</span>
                </div>
            </footer>
        </main>
    </div>
</template>

<script>
export default {
    data() {
        return {
            base: '/figma-portfolio',
            texts: ['Software Engineer', 'UI/UX Designer', 'Web Developer'],
            currentTextIndex: 0,
            displayedText: '',
            isDeleting: false,
            typingSpeed: 90,
            timer: null,
            contactEmail: 'duyahihi@gmail.com',
            social: {
                github: '',
                instagram: '',
                linkedin: '',
            },
            experienceCards: [
                {
                    id: 'webhr-management',
                    title: 'Back End Developer',
                    description: 'Participate in developing and maintaining backend systems using Java, PHP, Spring Boot, Laravel, Hibernate/JPA, building RESTful APIs, and integrating external services.',
                    icon: '/figma-portfolio/cards/card-1.png',
                    href: '',
                },
                {
                    id: 'webhr-kiosk',
                    title: 'Font End Developer',
                    description: 'Front-End Developer builds user interfaces for websites and apps. Using HTML, CSS, JavaScript, and frameworks like React or Vue, they transform designs into responsive, interactive products. This role bridges design and user experience, ensuring smooth performance and compatibility across platforms.',
                    icon: '/figma-portfolio/cards/card-2.png',
                    href: '',
                },
                {
                    id: 'somezing',
                    title: 'Somezing – AI-Powered Agents',
                    description: 'Somezing is an AI-Powered Agents to automate your workflows. It is a simple and easy to use app that allows you to automate your workflows.',
                    icon: '/figma-portfolio/cards/card-3.png',
                    href: '',
                },
                {
                    id: 'fileit',
                    title: 'FileIT – File Sharing App',
                    description: 'FileIT is a file sharing app that allows you to share files with your friends and family. It is a simple and easy to use app that lets you share files easily.',
                    icon: '/figma-portfolio/cards/card-4.png',
                    href: '',
                },
            ],
            featuredProjects: [
                {
                    id: 'neuraweb',
                    title: 'NeuraWeb – Futuristic AI Website Landing Design',
                    description:
                        'A sleek, dark-themed AI-powered landing page concept built in Figma. Designed for modern startups and futuristic digital products, it features glowing neon visuals, immersive UI, and a dynamic tone. The layout emphasizes clarity, hierarchy, and storytelling, while the visuals hint at next‑gen technology. The design encapsulates the cutting-edge possibilities of AI and tech, offering a glimpse into the future of online experiences for tech-forward companies.',
                    image: '/figma-portfolio/projects/project-1.png',
                    href: '',
                },
                {
                    id: 'vision-pro',
                    title: 'Apple Vision Pro – HR Software Design',
                    description:
                        'A futuristic HR software concept designed for Apple Vision Pro, built in Figma to reimagine attendance, leave tracking, and employee experience — all in one immersive interface. This concept explores spatial UI patterns, quick-glance metrics, and streamlined actions to reduce friction for both employees and HR teams. The focus is on readability, comfort, and an experience that feels native to mixed reality.',
                    image: '/figma-portfolio/projects/project-2.png',
                    href: '',
                },
            ],
        }
    },
    mounted() {
        this.tick()
    },
    beforeDestroy() {
        if (this.timer) clearTimeout(this.timer)
    },
    methods: {
        schedule(ms) {
            if (this.timer) clearTimeout(this.timer)
            this.timer = setTimeout(() => this.tick(), ms)
        },
        tick() {
            const currentText = this.texts[this.currentTextIndex]

            if (!this.isDeleting) {
                if (this.displayedText.length < currentText.length) {
                    this.displayedText = currentText.slice(0, this.displayedText.length + 1)
                    this.schedule(this.typingSpeed)
                    return
                }

                this.isDeleting = true
                this.typingSpeed = 45
                this.schedule(1600)
                return
            }

            if (this.displayedText.length > 0) {
                this.displayedText = currentText.slice(0, this.displayedText.length - 1)
                this.schedule(this.typingSpeed)
                return
            }

            this.isDeleting = false
            this.typingSpeed = 90
            this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length
            this.schedule(this.typingSpeed)
        },
    },
}
</script>
