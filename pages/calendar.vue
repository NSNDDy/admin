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

<style scoped>
.calendar-page {
  padding: 22px;
  background: #f8f9fa;
  min-height: calc(100vh - 140px);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #1f2d3d;
}

.subtitle {
  margin-top: 6px;
  color: #6c757d;
  font-size: 14px;
}

.btn-ghost {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  font-weight: 600;
}

.btn-ghost:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}

.calendar-layout {
  display: block;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.month-card {
  background: white;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.month-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08);
}

.month-card.active {
  border-color: rgba(102, 126, 234, 0.45);
  box-shadow: 0 18px 40px rgba(102, 126, 234, 0.12);
}

.month-title {
  padding: 12px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12), rgba(118, 75, 162, 0.10));
  font-weight: 800;
  color: #1f2d3d;
}

.month-meta {
  font-weight: 700;
  color: rgba(31, 45, 61, 0.6);
  font-size: 12px;
}

.dow-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  padding: 8px 10px 0;
  gap: 6px;
}

.dow-cell {
  font-size: 11px;
  font-weight: 700;
  color: #6c757d;
  text-align: center;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  padding: 8px 10px 12px;
  gap: 6px;
}

.day-cell {
  height: 30px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  user-select: none;
}

.day-cell.blank {
  background: transparent;
}

.day-btn {
  background: rgba(31, 45, 61, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.12s ease, background 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
  font-weight: 700;
  color: #1f2d3d;
}

.day-btn:hover {
  transform: translateY(-1px);
  background: rgba(102, 126, 234, 0.14);
  border-color: rgba(102, 126, 234, 0.35);
  box-shadow: 0 10px 18px rgba(102, 126, 234, 0.12);
}

.day-btn.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: rgba(102, 126, 234, 0.6);
}

.day-btn.today:not(.selected) {
  background: rgba(40, 167, 69, 0.12);
  border-color: rgba(40, 167, 69, 0.35);
}

.day-btn.hasTodos:not(.selected) {
  position: relative;
}

.day-btn.hasTodos:not(.selected)::after {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(102, 126, 234, 0.9);
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
}

.day-panel {
  position: sticky;
  top: 100px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.month-view {
  position: fixed;
  inset: 0;
  padding: 40px 60px;
  z-index: 2000;
  overflow: auto;
}

.month-view-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.month-view-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.mv-month {
  font-size: 18px;
  font-weight: 900;
  color: #1f2d3d;
}

.mv-year {
  font-size: 12px;
  font-weight: 800;
  color: rgba(31, 45, 61, 0.6);
}

.month-view-spacer {
  width: 1px;
  height: 1px;
}


.month-view-days {
  background: white;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  padding: 14px;
}

.mv-dow-row {
  display: grid;
  grid-template-columns: repeat(7, 38px);
  gap: 5px;
  margin-bottom: 4px;
}

.mv-dow-cell {
  font-size: 12px;
  font-weight: 800;
  color: rgba(55, 48, 82, 0.45);
  text-align: center;
  line-height: 24px;
}

.mv-days-grid {
  display: grid;
  grid-template-columns: repeat(7, 38px);
  gap: 5px;
}

.mv-day {
  width: 38px;
  height: 34px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  user-select: none;
}

.mv-day.blank {
  background: transparent;
}

.mv-day-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
  color: rgba(55, 48, 82, 0.55);
}

.mv-day-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

.status-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.status-pill {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(31, 45, 61, 0.03);
  border-radius: 999px;
  padding: 8px 10px;
  cursor: pointer;
  font-weight: 900;
  font-size: 12px;
  color: rgba(31, 45, 61, 0.75);
  transition: transform 0.12s ease, background 0.12s ease, border-color 0.12s ease;
}

.status-pill.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.18), rgba(118, 75, 162, 0.14));
  border-color: rgba(102, 126, 234, 0.35);
  color: #1f2d3d;
}

.status-chip {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(31, 45, 61, 0.03);
  border-radius: 999px;
  padding: 4px 10px;
  cursor: pointer;
  font-weight: 900;
  font-size: 12px;
  color: rgba(31, 45, 61, 0.75);
}

.todo-item.s-open {
  border-left: 4px solid rgba(102, 126, 234, 0.8);
}

.todo-item.s-progress {
  border-left: 4px solid rgba(255, 193, 7, 0.8);
}

.todo-item.s-done {
  border-left: 4px solid rgba(40, 167, 69, 0.85);
}

.todo-item.s-close {
  border-left: 4px solid rgba(108, 117, 125, 0.85);
  opacity: 0.72;
}

.status-chip.s-open {
  background: rgba(102, 126, 234, 0.12);
  border-color: rgba(102, 126, 234, 0.25);
}

.status-chip.s-progress {
  background: rgba(255, 193, 7, 0.16);
  border-color: rgba(255, 193, 7, 0.32);
}

.status-chip.s-done {
  background: rgba(40, 167, 69, 0.12);
  border-color: rgba(40, 167, 69, 0.25);
}

.status-chip.s-close {
  background: rgba(108, 117, 125, 0.12);
  border-color: rgba(108, 117, 125, 0.25);
}

.todo-open-enter-active,
.todo-open-leave-active {
  transition: all 0.18s ease;
}

.todo-open-enter,
.todo-open-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.todo-progress-enter-active,
.todo-progress-leave-active {
  transition: all 0.2s ease;
}

.todo-progress-enter,
.todo-progress-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.todo-done-enter-active,
.todo-done-leave-active {
  transition: all 0.22s ease;
}

.todo-done-enter,
.todo-done-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.todo-close-enter-active,
.todo-close-leave-active {
  transition: all 0.2s ease;
}

.todo-close-enter,
.todo-close-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.month-view-enter-active,
.month-view-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.month-view-enter,
.month-view-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.panel-card {
  background: white;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  padding: 14px;
}

.panel-title {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.panel-label {
  font-size: 12px;
  font-weight: 800;
  color: rgba(31, 45, 61, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.panel-date {
  font-size: 20px;
  font-weight: 900;
  color: #1f2d3d;
}

.todo-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-form-row {
  display: grid;
  grid-template-columns: 1fr 140px;
  gap: 10px;
}

.todo-input,
.todo-select {
  width: 100%;
  padding: 11px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  outline: none;
  transition: box-shadow 0.12s ease, border-color 0.12s ease;
  font-size: 14px;
}

.todo-input:focus,
.todo-select:focus {
  border-color: rgba(102, 126, 234, 0.55);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.12);
}

.btn-primary {
  padding: 11px 12px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.25);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}

.list-title {
  font-size: 16px;
  font-weight: 900;
  color: #1f2d3d;
}

.list-meta {
  font-size: 13px;
  color: #6c757d;
  font-weight: 700;
}

.empty-state {
  padding: 14px;
  border-radius: 12px;
  background: rgba(31, 45, 61, 0.04);
  color: #6c757d;
  font-weight: 600;
  font-size: 14px;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  display: grid;
  grid-template-columns: 34px 1fr 34px;
  gap: 10px;
  align-items: center;
  padding: 10px 10px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: white;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.todo-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
}

.todo-item.done {
  opacity: 0.65;
}

.check-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(31, 45, 61, 0.04);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s ease, border-color 0.12s ease;
}

.todo-item.done .check-btn {
  background: rgba(40, 167, 69, 0.12);
  border-color: rgba(40, 167, 69, 0.25);
}

.check-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: rgba(31, 45, 61, 0.35);
}

.todo-item.done .check-dot {
  background: rgba(40, 167, 69, 0.9);
}

.todo-main {
  min-width: 0;
}

.todo-text {
  font-weight: 800;
  color: #1f2d3d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.todo-meta {
  margin-top: 4px;
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.badge {
  font-size: 12px;
  font-weight: 900;
  padding: 4px 8px;
  border-radius: 999px;
}

.badge.p-high {
  background: rgba(220, 53, 69, 0.12);
  color: #dc3545;
}

.badge.p-medium {
  background: rgba(255, 193, 7, 0.14);
  color: #b07c00;
}

.badge.p-low {
  background: rgba(23, 162, 184, 0.12);
  color: #17a2b8;
}

.project {
  font-size: 12px;
  font-weight: 800;
  color: rgba(31, 45, 61, 0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(220, 53, 69, 0.10);
  color: #dc3545;
  cursor: pointer;
  font-weight: 900;
}

.calendar-page {
  background: radial-gradient(1200px 700px at 20% 10%, rgba(167, 139, 250, 0.22), transparent 55%),
              radial-gradient(900px 600px at 85% 25%, rgba(102, 126, 234, 0.18), transparent 60%),
              radial-gradient(900px 700px at 50% 90%, rgba(118, 75, 162, 0.16), transparent 60%),
              #f3f4f8;
}

.month-card {
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 18px 50px rgba(44, 38, 76, 0.08);
  backdrop-filter: blur(10px);
}

.month-title {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.18));
}

.month-view {
  background: radial-gradient(1100px 700px at 15% 15%, rgba(186, 182, 210, 0.45), transparent 58%),
              radial-gradient(900px 700px at 80% 15%, rgba(168, 172, 205, 0.35), transparent 62%),
              radial-gradient(900px 700px at 50% 90%, rgba(176, 168, 200, 0.30), transparent 62%),
              #c8c9d6;
}

.mv-watermark {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 0;
  gap: 0;
  line-height: 1.05;
}

.mv-watermark span {
  font-weight: 900;
  font-size: clamp(80px, 12vw, 160px);
  color: rgba(31, 45, 61, 0.06);
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.glass-card {
  background: rgba(220, 222, 235, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(44, 38, 76, 0.10);
  backdrop-filter: blur(18px);
}

.month-view-layout {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 16px;
  align-items: stretch;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0;
}

.mv-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mv-top-area {
  position: relative;
  min-height: 280px;
}

.mv-right {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mv-back {
  border-radius: 12px;
  padding: 10px 16px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.30);
  backdrop-filter: blur(14px);
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  color: rgba(31, 45, 61, 0.7);
  text-align: left;
  flex-shrink: 0;
}

.mv-date-card {
  position: absolute;
  top: 28px;
  left: 95px;
  z-index: 2;
  width: 265px;
  padding: 18px;
  background: rgba(210, 214, 232, 0.70);
  border: 1px solid rgba(255, 255, 255, 0.70);
  box-shadow: 0 8px 28px rgba(44, 38, 76, 0.12);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 240px;
}

.mv-calendar-card {
  width: 100%;
  height: 100%;
  padding: 20px 30px 20px 220px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.mv-input-card {
  padding: 16px;
}

.mv-todo-card {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.mv-date-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  color: rgba(55, 48, 82, 0.55);
  font-weight: 900;
  font-size: 13px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.50);
  margin-bottom: 8px;
}

.mv-date-month {
  font-size: 13px;
  position: relative;
}

.mv-date-month::before {
  content: '"';
  position: relative;
  top: -2px;
  font-size: 16px;
  color: rgba(55, 48, 82, 0.30);
}

.mv-date-year {
  font-size: 14px;
  font-weight: 800;
}

.mv-date-day {
  font-size: 96px;
  line-height: 1;
  font-weight: 900;
  color: rgba(55, 48, 82, 0.82);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mv-date-weekday {
  font-size: 15px;
  font-weight: 800;
  color: rgba(55, 48, 82, 0.50);
  text-align: center;
}

.mv-clock-card {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  flex: 1;
}

.mv-clock-head {
  font-weight: 900;
  font-size: 15px;
  color: rgba(31, 45, 61, 0.65);
}

.mv-clock-main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.mv-clock-time {
  font-size: clamp(48px, 8vw, 86px);
  font-weight: 900;
  letter-spacing: -0.03em;
  color: rgba(31, 45, 61, 0.85);
}

.mv-clock-ms {
  font-size: clamp(20px, 3vw, 36px);
  font-weight: 900;
  color: rgba(31, 45, 61, 0.45);
}

.mv-clock-meridiem {
  font-weight: 900;
  font-size: clamp(36px, 6vw, 72px);
  color: rgba(31, 45, 61, 0.55);
}


.mv-day-btn.selected {
  background: rgba(50, 42, 72, 0.80);
  color: #fff;
  font-weight: 800;
}

.mv-day-btn.today:not(.selected) {
  background: rgba(255, 255, 255, 0.30);
  font-weight: 800;
  color: rgba(55, 48, 82, 0.75);
}

.mv-day-btn.hasTodos:not(.selected) {
  position: relative;
}

.mv-day-btn.hasTodos:not(.selected)::after {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: rgba(44, 38, 76, 0.38);
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
}

.mv-input-card {
  padding: 18px;
}

.mv-todo-card {
  padding: 18px;
}

.mv-todo-card .empty-state {
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.45);
  color: rgba(31, 45, 61, 0.65);
}

.mv-todo-card .status-pill {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.45);
}

.mv-todo-card .todo-list {
  flex: 1;
  overflow-y: auto;
}

.mv-todo-card .todo-item {
  background: rgba(255, 255, 255, 0.28);
  border-color: rgba(255, 255, 255, 0.50);
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 12px;
  border-left: 0;
}

.mv-todo-card .todo-item:hover {
  box-shadow: 0 18px 45px rgba(44, 38, 76, 0.10);
}

.mv-todo-card .delete-btn {
  background: rgba(255, 255, 255, 0.24);
  border-color: rgba(255, 255, 255, 0.45);
}

.todo-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.todo-check {
  width: 16px;
  height: 16px;
  accent-color: rgba(102, 126, 234, 0.85);
  cursor: pointer;
  flex-shrink: 0;
}

.mv-todo-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mv-form-row {
  display: grid;
  grid-template-columns: 1fr 140px;
  gap: 10px;
}

.mv-input,
.mv-select {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.50);
  background: rgba(255, 255, 255, 0.25);
  outline: none;
  font-weight: 700;
  font-size: 13px;
  color: rgba(31, 45, 61, 0.7);
  backdrop-filter: blur(14px);
}

.mv-input:focus,
.mv-select:focus {
  border-color: rgba(102, 126, 234, 0.55);
  box-shadow: 0 0 0 5px rgba(102, 126, 234, 0.14);
}

.mv-add {
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.25);
  color: rgba(31, 45, 61, 0.7);
  font-weight: 800;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 13px;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}

.mv-add:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 45px rgba(102, 126, 234, 0.22);
}

.mv-add:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.mv-todo-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.50);
}

.mv-todo-title {
  font-weight: 900;
  font-size: 15px;
  color: rgba(31, 45, 61, 0.82);
}

.mv-todo-icon {
  font-size: 16px;
}

.mv-todo-count {
  font-weight: 900;
  color: rgba(31, 45, 61, 0.55);
}

@media (max-width: 1200px) {
  .month-view-layout {
    flex-direction: column;
    height: auto;
  }

  .mv-right {
    width: 100%;
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .mv-right {
    flex-direction: column;
  }

  .mv-calendar-card {
    padding-left: 20px;
    padding-top: 220px;
  }

  .mv-date-day {
    font-size: 56px;
  }
}

@media (max-width: 700px) {
  .mv-form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1200px) {
  .calendar-layout {
    grid-template-columns: 1fr;
  }

  .day-panel {
    position: static;
    top: auto;
  }
}

@media (max-width: 900px) {
  .month-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .month-grid {
    grid-template-columns: 1fr;
  }

  .todo-form-row {
    grid-template-columns: 1fr;
  }
}
</style>
