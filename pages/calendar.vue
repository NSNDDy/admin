<template>
  <div class="calendar-page">
    <div class="calendar-header">
      <div class="header-left">
        <h1 class="title">Calendar</h1>
        <div class="subtitle">Năm {{ year }} · Chọn ngày để quản lý công việc</div>
      </div>
      <div class="header-right">
        <button class="btn-ghost" @click="goToDashboard">← Dashboard</button>
      </div>
    </div>

    <div class="calendar-layout">
      <section class="year-view">
        <div class="month-grid">
          <div
            v-for="(month, idx) in monthNames"
            :key="month"
            class="month-card"
            :class="{ active: idx === selectedMonthIndex }"
          >
            <div class="month-title" @click="openMonth(idx)">
              <span>{{ month }}</span>
              <span class="month-meta">{{ year }}</span>
            </div>

            <div class="dow-row">
              <div v-for="d in weekDayLabels" :key="d" class="dow-cell">{{ d }}</div>
            </div>

            <div class="days-grid">
              <div v-for="n in monthLeadingBlanks(idx)" :key="'b-' + idx + '-' + n" class="day-cell blank"></div>
              <button
                v-for="day in daysInMonth(idx)"
                :key="'d-' + idx + '-' + day"
                class="day-cell day-btn"
                :class="dayClass(idx, day)"
                @click.stop="openMonthAndSelectDay(idx, day)"
                type="button"
              >
                {{ day }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CalendarPage',
  layout: 'listbase',
  middleware: 'authenticated',
  data() {
    const now = new Date()
    const pad2 = (n) => String(n).padStart(2, '0')
    const todayIso = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
    return {
      year: now.getFullYear(),
      weekDayLabels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
      monthNames: [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12'
      ],
      todayIso,
      selectedDateIso: todayIso,
      selectedMonthIndex: now.getMonth(),
      todosByDate: {},
      storageKey: 'calendar_todos_v1'
    }
  },
  computed: {
    selectedTodos() {
      return this.todosByDate[this.selectedDateIso] || []
    }
  },
  mounted() {
    this.loadTodos()
  },
  methods: {
    goToDashboard() {
      this.$router.push('/dashboard')
    },
    openMonth(monthIndex) {
      this.selectedMonthIndex = monthIndex
      this.navigateToMonthView(monthIndex, 1)
    },
    openMonthAndSelectDay(monthIndex, day) {
      this.selectedMonthIndex = monthIndex
      this.selectedDateIso = this.isoForDay(monthIndex, day)
      this.navigateToMonthView(monthIndex, day)
    },
    navigateToMonthView(monthIndex, day) {
      const nextQuery = {
        year: String(this.year),
        month: String(monthIndex + 1),
        day: String(day)
      }
      this.$router.push({ path: '/month', query: nextQuery })
    },
    pad2(n) {
      return String(n).padStart(2, '0')
    },
    toISODateLocal(date) {
      const y = date.getFullYear()
      const m = this.pad2(date.getMonth() + 1)
      const d = this.pad2(date.getDate())
      return `${y}-${m}-${d}`
    },
    firstDowIndexMondayZero(monthIndex) {
      const first = new Date(this.year, monthIndex, 1)
      return (first.getDay() + 6) % 7
    },
    daysInMonth(monthIndex) {
      return new Date(this.year, monthIndex + 1, 0).getDate()
    },
    monthLeadingBlanks(monthIndex) {
      return this.firstDowIndexMondayZero(monthIndex)
    },
    isoForDay(monthIndex, day) {
      return `${this.year}-${this.pad2(monthIndex + 1)}-${this.pad2(day)}`
    },
    dayClass(monthIndex, day) {
      const iso = this.isoForDay(monthIndex, day)
      return {
        today: iso === this.todayIso,
        selected: iso === this.selectedDateIso,
        hasTodos: (this.todosByDate[iso] || []).length > 0
      }
    },
    async loadTodos() {
      await this.getAll()
    },
    async getAll() {
      try {
        const res = await this.$axios.$get('/api/todos')
        const list = (res && res.data) ? res.data : []
        const grouped = {}
        for (const it of list) {
          const dateIso = it && it.date ? String(it.date) : null
          if (!dateIso) continue
          if (!grouped[dateIso]) grouped[dateIso] = []
          grouped[dateIso].push({
            id: it.id,
            text: it.text,
            project: it.project || '',
            priority: it.priority || 'medium',
            status: it.status || 'open',
            done: !!it.done,
            createdAt: it.createdAt
          })
        }
        this.todosByDate = grouped
        this.saveLocalCache()
      } catch (e) {
        try {
          const raw = localStorage.getItem(this.storageKey)
          this.todosByDate = raw ? JSON.parse(raw) : {}
        } catch (err) {
          this.todosByDate = {}
        }
      }
    },
    saveLocalCache() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.todosByDate))
      } catch (e) {}
    }
  }
}
</script>
