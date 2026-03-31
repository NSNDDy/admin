<template>
  <div class="month-page">
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
            <div v-if="editingTodoId" class="mv-editing-banner">
              <span>Đang sửa #{{ editingTodoId }}</span>
              <button class="mv-cancel" type="button" @click="cancelEdit">Huỷ</button>
            </div>
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
            <button class="mv-add" type="submit" :disabled="!newTodoText.trim()">
              {{ editingTodoId ? 'Cập nhật' : 'Thêm vào danh sách   ▸' }}
            </button>
          </form>
        </div>
      </aside>
      
    </div>

    <div class="mv-table-area">
      <TodoMonthTable
        :year="year"
        :month="monthViewMonthIndex + 1"
        :refresh-key="tableRefreshKey"
        @changed="handleTableChanged"
        @edit="startEditFromTable"
      />
    </div>
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
      editingTodoId: null,
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
      tableRefreshKey: 0,
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
      if (this.editingTodoId) {
        try {
          const payload = {
            text,
            project: this.newTodoProject.trim(),
            priority: this.newTodoPriority,
            status: this.newTodoStatus
          }
          await this.$axios.$put(`/api/todos/${this.editingTodoId}`, payload)
          this.tableRefreshKey = (this.tableRefreshKey || 0) + 1
          await this.loadTodos()
        } catch (e) {}
      } else {
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
            this.tableRefreshKey = (this.tableRefreshKey || 0) + 1
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
          this.tableRefreshKey = (this.tableRefreshKey || 0) + 1
        }
      }
      this.newTodoText = ''
      this.newTodoProject = ''
      this.newTodoPriority = 'medium'
      this.newTodoStatus = 'open'
      this.editingTodoId = null
    },
    async handleTableChanged() {
      this.tableRefreshKey = (this.tableRefreshKey || 0) + 1
      await this.loadTodos()
    },
    startEditFromTable(row) {
      this.editingTodoId = row.id
      this.newTodoText = row.text || ''
      this.newTodoProject = row.project || ''
      this.newTodoPriority = row.priority || 'medium'
      this.newTodoStatus = row.status || 'open'
    },
    cancelEdit() {
      this.editingTodoId = null
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
