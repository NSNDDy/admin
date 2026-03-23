<template>
  <div class="month-view">
    <div class="mv-watermark">
      <span>{{ selectedWeekday }}</span>
      <span>{{ monthNames[monthViewMonthIndex] }}</span>
      <span>{{ monthNames[monthViewMonthIndex] }}</span>
      <span>{{ monthNames[monthViewMonthIndex] }}</span>
    </div>

    <button class="mv-back" type="button" @click="goBack">← Back</button>

    <div class="month-view-layout">
      <div class="mv-left">
        <div class="mv-top-area">
          <section class="glass-card mv-date-card">
            <div class="mv-date-top">
              <div class="mv-date-month">{{ monthNames[monthViewMonthIndex] }}</div>
              <div class="mv-date-year">{{ year }}</div>
            </div>
            <div class="mv-date-day">{{ selectedDayNumber }}</div>
            <div class="mv-date-weekday">{{ selectedWeekday }}</div>
          </section>

          <section class="glass-card mv-calendar-card">
            <div class="mv-dow-row">
              <div v-for="d in weekDayLabels" :key="'mv-' + d" class="mv-dow-cell">{{ d }}</div>
            </div>
            <div class="mv-days-grid">
              <div v-for="n in monthLeadingBlanks(monthViewMonthIndex)" :key="'mv-b-' + n" class="mv-day blank"></div>
              <button
                v-for="day in daysInMonth(monthViewMonthIndex)"
                :key="'mv-d-' + day"
                class="mv-day mv-day-btn"
                :class="dayClass(monthViewMonthIndex, day)"
                @click="selectDay(monthViewMonthIndex, day)"
                type="button"
              >
                {{ day }}
              </button>
            </div>
          </section>
        </div>

        <section class="glass-card mv-clock-card">
          <div class="mv-clock-head">Clock  ⏱</div>
          <div class="mv-clock-main">
            <span class="mv-clock-time">{{ clockTimeHms }} <span class="mv-clock-meridiem">{{ clockMeridiem }}</span></span>
            <span ></span>
          </div>
        </section>
      </div>

      <aside class="mv-right">
        <div class="glass-card mv-input-card">
          <form class="mv-todo-form" @submit.prevent="addTodo">
            <input
              v-model="newTodoText"
              class="mv-input"
              type="text"
              placeholder="Nhập nội dung công việc"
              autocomplete="off"
            />
            <input
              v-model="newTodoProject"
              class="mv-input"
              type="text"
              placeholder="Dự án (tùy chọn)"
              autocomplete="off"
            />
            <div class="mv-form-row">
              <GlassSelect v-model="newTodoPriority" :options="priorityOptions" placeholder="Priority" />
              <GlassSelect v-model="newTodoStatus" :options="statusOptions" placeholder="Status" />
            </div>
            <button class="mv-add" type="submit" :disabled="!newTodoText.trim()">Thêm vào danh sách   ▸</button>
          </form>
        </div>

        <div class="glass-card mv-todo-card">
          <div class="mv-todo-head">
            <div class="mv-todo-title">Todo List</div>
            <div class="mv-todo-icon">📋</div>
          </div>

          <div v-if="selectedTodos.length === 0" class="empty-state">
            Chưa có công việc nào.
          </div>

          <div v-else class="todo-list">
            <div
              v-for="item in selectedTodos"
              :key="item.id"
              class="todo-item"
              :class="{ done: item.done }"
            >
              <div class="todo-text">{{ item.text }}</div>
              <input class="todo-check" type="checkbox" :checked="item.done" @change="toggleTodo(item.id)" />
            </div>
          </div>
        </div>
      </aside>
    </div>

    <div class="mv-table-area">
      <TodoMonthTable :year="year" :month="monthViewMonthIndex + 1" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CalendarMonthPage',
  // layout: 'listbase',
  middleware: 'authenticated',
  components: {
    GlassSelect: () => import('~/components/GlassSelect.vue'),
    TodoMonthTable: () => import('~/components/TodoMonthTable.vue')
  },
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
      monthViewMonthIndex: now.getMonth(),
      newTodoText: '',
      newTodoProject: '',
      newTodoPriority: 'medium',
      newTodoStatus: 'open',
      priorityOptions: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
      ],
      statusOptions: [
        { value: 'open', label: 'Open' },
        { value: 'progress', label: 'Progress' },
        { value: 'done', label: 'Done' },
        { value: 'close', label: 'Close' }
      ],
      todosByDate: {},
      storageKey: 'calendar_todos_v1',
      clockNow: now,
      clockTimer: null
    }
  },
  computed: {
    selectedTodos() {
      return this.todosByDate[this.selectedDateIso] || []
    },
    selectedDayNumber() {
      const parts = this.selectedDateIso.split('-')
      return parts.length === 3 ? parts[2] : ''
    },
    selectedWeekday() {
      const parts = this.selectedDateIso.split('-').map((n) => parseInt(n, 10))
      if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return ''
      const dt = new Date(parts[0], parts[1] - 1, parts[2])
      const labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return labels[dt.getDay()] || ''
    },
    clockTime() {
      const dt = this.clockNow instanceof Date ? this.clockNow : new Date()
      let h = dt.getHours()
      const m = String(dt.getMinutes()).padStart(2, '0')
      const s = String(dt.getSeconds()).padStart(2, '0')
      h = h % 12
      if (h === 0) h = 12
      return `${String(h).padStart(2, '0')}:${m}:${s}`
    },
    clockTimeHms() {
      return this.clockTime
    },
    clockMeridiem() {
      const dt = this.clockNow instanceof Date ? this.clockNow : new Date()
      return dt.getHours() >= 12 ? 'PM' : 'AM'
    }
  },
  mounted() {
    this.loadTodos()
    this.startClock()
    this.syncFromRoute()
  },
  beforeDestroy() {
    this.stopClock()
  },
  watch: {
    $route() {
      this.syncFromRoute()
    }
  },
  methods: {
    goBack() {
      this.$router.push('/calendar')
    },
    syncFromRoute() {
      const q = (this.$route && this.$route.query) ? this.$route.query : {}
      const yearRaw = q.year
      const monthRaw = q.month
      const dayRaw = q.day

      const parsedYear = parseInt(String(yearRaw || ''), 10)
      if (!Number.isNaN(parsedYear) && parsedYear > 1970 && parsedYear < 3000) {
        this.year = parsedYear
      }

      let monthIndex = parseInt(String(monthRaw || ''), 10) - 1
      if (Number.isNaN(monthIndex)) monthIndex = new Date().getMonth()
      if (monthIndex < 0) monthIndex = 0
      if (monthIndex > 11) monthIndex = 11

      let day = parseInt(String(dayRaw || ''), 10)
      if (Number.isNaN(day) || day < 1) day = 1
      const maxDay = new Date(this.year, monthIndex + 1, 0).getDate()
      if (day > maxDay) day = maxDay

      this.monthViewMonthIndex = monthIndex
      this.selectedDateIso = this.isoForDay(monthIndex, day)
    },
    selectDay(monthIndex, day) {
      this.monthViewMonthIndex = monthIndex
      this.selectedDateIso = this.isoForDay(monthIndex, day)
      const nextQuery = { ...(this.$route && this.$route.query ? this.$route.query : {}) }
      nextQuery.year = String(this.year)
      nextQuery.month = String(monthIndex + 1)
      nextQuery.day = String(day)
      this.$router.replace({ path: '/month', query: nextQuery })
    },
    startClock() {
      if (process.server) return
      if (this.clockTimer) return
      this.clockNow = new Date()
      this.clockTimer = setInterval(() => {
        this.clockNow = new Date()
      }, 250)
    },
    stopClock() {
      if (!this.clockTimer) return
      clearInterval(this.clockTimer)
      this.clockTimer = null
    },
    pad2(n) {
      return String(n).padStart(2, '0')
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
    },
    async addTodo() {
      const text = this.newTodoText.trim()
      if (!text) return
      try {
        const payload = {
          date: this.selectedDateIso,
          text,
          project: this.newTodoProject.trim(),
          priority: this.newTodoPriority,
          status: this.newTodoStatus
        }
        const res = await this.$axios.$post('/api/todos', payload)
        const saved = (res && res.data) ? res.data : null
        if (saved) {
          const next = [...this.selectedTodos, {
            id: saved.id,
            text: saved.text,
            project: saved.project || '',
            priority: saved.priority || 'medium',
            status: saved.status || 'open',
            done: !!saved.done,
            createdAt: saved.createdAt
          }]
          this.$set(this.todosByDate, this.selectedDateIso, next)
          this.saveLocalCache()
        }
      } catch (e) {
        const item = {
          id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
          text,
          project: this.newTodoProject.trim(),
          priority: this.newTodoPriority,
          status: this.newTodoStatus,
          done: this.newTodoStatus === 'done',
          createdAt: Date.now()
        }
        const next = [...this.selectedTodos, item]
        this.$set(this.todosByDate, this.selectedDateIso, next)
        this.saveLocalCache()
      }
      this.newTodoText = ''
      this.newTodoProject = ''
      this.newTodoPriority = 'medium'
      this.newTodoStatus = 'open'
    },
    async toggleTodo(id) {
      const current = this.selectedTodos.find(t => t.id === id)
      const nextDone = current ? !current.done : true
      try {
        const nextStatus = nextDone ? 'done' : 'open'
        await this.$axios.$put(`/api/todos/${id}`, { done: nextDone, status: nextStatus })
        const next = this.selectedTodos.map((t) => (t.id === id ? { ...t, done: nextDone, status: nextStatus } : t))
        this.$set(this.todosByDate, this.selectedDateIso, next)
        this.saveLocalCache()
      } catch (e) {
        const nextStatus = nextDone ? 'done' : 'open'
        const next = this.selectedTodos.map((t) => (t.id === id ? { ...t, done: nextDone, status: nextStatus } : t))
        this.$set(this.todosByDate, this.selectedDateIso, next)
        this.saveLocalCache()
      }
    }
  }
}
</script>

<style scoped>
.month-view {
  min-height: 100vh;
  padding: 22px;
  background: radial-gradient(1100px 700px at 15% 15%, rgba(186, 182, 210, 0.45), transparent 58%),
              radial-gradient(900px 700px at 80% 15%, rgba(168, 172, 205, 0.35), transparent 62%),
              radial-gradient(900px 700px at 50% 90%, rgba(176, 168, 200, 0.30), transparent 62%),
              #c8c9d6;
  position: relative;
  overflow: auto;
  box-sizing: border-box;
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

.mv-back {
  margin-left: 20px;
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
  position: relative;
  z-index: 2;
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

.mv-table-area {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 16px auto 0;
}

.mv-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mv-right {
  position: relative;
  z-index: 3;
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mv-top-area {
  position: relative;
  min-height: 280px;
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

.mv-input-card {
  position: relative;
  z-index: 6;
  padding: 18px;
}

.mv-todo-card {
  position: relative;
  z-index: 1;
  padding: 18px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.empty-state {
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.45);
  color: rgba(31, 45, 61, 0.65);
  font-weight: 600;
  font-size: 14px;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  background: rgba(255, 255, 255, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.50);
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 12px;
}

.todo-item:hover {
  box-shadow: 0 18px 45px rgba(44, 38, 76, 0.10);
}

.todo-item.done {
  opacity: 0.65;
}

.todo-text {
  font-weight: 800;
  color: rgba(31, 45, 61, 0.82);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
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
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.mv-input {
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

.mv-input:focus {
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

  .mv-form-row {
    grid-template-columns: 1fr;
  }

  .mv-calendar-card {
    padding-left: 20px;
    padding-top: 220px;
  }

  .mv-date-day {
    font-size: 56px;
  }
}
</style>
