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
            <div class="month-title" @click="selectMonth(idx)">
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
                @click="selectDay(idx, day)"
                type="button"
              >
                {{ day }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside class="day-panel">
        <div class="panel-card">
          <div class="panel-title">
            <div class="panel-label">Ngày đang chọn</div>
            <div class="panel-date">{{ selectedDateLabel }}</div>
          </div>

          <form class="todo-form" @submit.prevent="addTodo">
            <input
              v-model="newTodoText"
              class="todo-input"
              type="text"
              placeholder="Nhập việc cần làm…"
              autocomplete="off"
            />
            <div class="todo-form-row">
              <input
                v-model="newTodoProject"
                class="todo-input"
                type="text"
                placeholder="Dự án (tuỳ chọn)"
                autocomplete="off"
              />
              <select v-model="newTodoPriority" class="todo-select">
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>
            <button class="btn-primary" type="submit" :disabled="!newTodoText.trim()">Thêm Todo</button>
          </form>
        </div>

        <div class="panel-card">
          <div class="list-header">
            <div class="list-title">Todo List</div>
            <div class="list-meta">{{ selectedTodos.length }} việc</div>
          </div>

          <div v-if="selectedTodos.length === 0" class="empty-state">
            Chưa có công việc nào cho ngày này.
          </div>

          <div v-else class="todo-list">
            <div v-for="item in selectedTodos" :key="item.id" class="todo-item" :class="{ done: item.done }">
              <button class="check-btn" type="button" @click="toggleTodo(item.id)" :title="item.done ? 'Bỏ hoàn thành' : 'Hoàn thành'">
                <span class="check-dot"></span>
              </button>
              <div class="todo-main">
                <div class="todo-text">{{ item.text }}</div>
                <div class="todo-meta">
                  <span class="badge" :class="'p-' + item.priority">{{ priorityLabel(item.priority) }}</span>
                  <span v-if="item.project" class="project">{{ item.project }}</span>
                </div>
              </div>
              <button class="delete-btn" type="button" @click="removeTodo(item.id)" title="Xoá">✕</button>
            </div>
          </div>
        </div>
      </aside>
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
      newTodoText: '',
      newTodoProject: '',
      newTodoPriority: 'medium',
      todosByDate: {},
      storageKey: 'calendar_todos_v1'
    }
  },
  computed: {
    selectedTodos() {
      return this.todosByDate[this.selectedDateIso] || []
    },
    selectedDateLabel() {
      const [y, m, d] = this.selectedDateIso.split('-')
      return `${d}/${m}/${y}`
    }
  },
  mounted() {
    this.loadTodos()
  },
  methods: {
    goToDashboard() {
      this.$router.push('/dashboard')
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
    selectMonth(monthIndex) {
      this.selectedMonthIndex = monthIndex
      const [y, m, d] = this.selectedDateIso.split('-')
      const currentDay = Number(d)
      const maxDay = this.daysInMonth(monthIndex)
      const nextDay = Math.min(currentDay, maxDay)
      this.selectDay(monthIndex, nextDay, y)
    },
    selectDay(monthIndex, day) {
      this.selectedMonthIndex = monthIndex
      this.selectedDateIso = this.isoForDay(monthIndex, day)
    },
    async loadTodos() {
      await this.getAll()
    },
    async getAll() {
      try {
        const res = await this.$axios.$get('/api/todos/all')
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
          priority: this.newTodoPriority
        }
        const res = await this.$axios.$post('/api/todos', payload)
        const saved = (res && res.data) ? res.data : null
        if (saved) {
          const next = [...this.selectedTodos, {
            id: saved.id,
            text: saved.text,
            project: saved.project || '',
            priority: saved.priority || 'medium',
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
          done: false,
          createdAt: Date.now()
        }
        const next = [...this.selectedTodos, item]
        this.$set(this.todosByDate, this.selectedDateIso, next)
        this.saveLocalCache()
      }

      this.newTodoText = ''
      this.newTodoProject = ''
      this.newTodoPriority = 'medium'
    },
    async toggleTodo(id) {
      const current = this.selectedTodos.find(t => t.id === id)
      const nextDone = current ? !current.done : true
      try {
        await this.$axios.$put(`/api/todos/${id}`, { done: nextDone })
        const next = this.selectedTodos.map((t) => (t.id === id ? { ...t, done: nextDone } : t))
        this.$set(this.todosByDate, this.selectedDateIso, next)
        this.saveLocalCache()
      } catch (e) {
        const next = this.selectedTodos.map((t) => (t.id === id ? { ...t, done: nextDone } : t))
        this.$set(this.todosByDate, this.selectedDateIso, next)
        this.saveLocalCache()
      }
    },
    async removeTodo(id) {
      try {
        await this.$axios.$delete(`/api/todos/${id}`)
        const next = this.selectedTodos.filter((t) => t.id !== id)
        this.$set(this.todosByDate, this.selectedDateIso, next)
        this.saveLocalCache()
      } catch (e) {
        const next = this.selectedTodos.filter((t) => t.id !== id)
        this.$set(this.todosByDate, this.selectedDateIso, next)
        this.saveLocalCache()
      }
    },
    priorityLabel(p) {
      if (p === 'high') return 'Cao'
      if (p === 'low') return 'Thấp'
      return 'TB'
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
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
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
