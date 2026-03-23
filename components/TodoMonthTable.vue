<template>
  <div class="todo-month-table">
    <div v-if="loading" class="state">Đang tải…</div>
    <div v-else-if="error" class="state error">{{ error }}</div>

    <div v-else class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th class="col-id">Mã thứ tự</th>
            <th class="col-text">Nội dung</th>
            <th class="col-project">Dự án</th>
            <th class="col-priority">Độ Ưu tiên</th>
            <th class="col-status">Trạng thái</th>
            <th class="col-created">Ngày tạo</th>
            <th class="col-updated">Ngày cập nhật</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="rows.length === 0">
            <td class="empty" colspan="5">Không có công việc trong tháng này.</td>
          </tr>
          <tr v-for="r in rows" :key="r.id">
            <td class="mono">{{ r.id }}</td>
            <td class="text">{{ r.text }}</td>
            <td class="project">{{ r.project }}</td>
            <td>
              <span class="pill" :class="'p-' + (r.priority || 'medium')">{{ r.priority || 'medium' }}</span>
            </td>
            <td>
              <span class="pill" :class="'s-' + (r.status || 'open')">{{ r.status || 'open' }}</span>
            </td>
            <td class="mono">{{ formatCreatedAt(r.createdAt) }}</td>
            <td class="mono">{{ formatCreatedAt(r.updatedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TodoMonthTable',
  props: {
    year: { type: Number, required: true },
    month: { type: Number, required: true }
  },
  data() {
    return {
      loading: false,
      error: '',
      rows: []
    }
  },
  computed: {
    range() {
      const y = this.year
      const m = this.month
      const start = `${y}-${String(m).padStart(2, '0')}-01`
      const lastDay = new Date(y, m, 0).getDate()
      const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      return { start, end }
    },
    rangeLabel() {
      return `${this.range.start} → ${this.range.end}`
    }
  },
  watch: {
    year: 'fetchData',
    month: 'fetchData'
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    normalizeDateValue(v) {
      if (!v) return null
      if (typeof v === 'number') return new Date(v)
      if (typeof v === 'string') {
        const dt = new Date(v)
        return Number.isNaN(dt.getTime()) ? null : dt
      }
      if (typeof v === 'object') {
        const epochSecond = v.epochSecond ?? v.seconds ?? v._seconds
        if (typeof epochSecond === 'number') return new Date(epochSecond * 1000)
      }
      return null
    },
    formatCreatedAt(v) {
      const dt = this.normalizeDateValue(v)
      if (!dt) return ''
      const y = dt.getFullYear()
      const m = String(dt.getMonth() + 1).padStart(2, '0')
      const d = String(dt.getDate()).padStart(2, '0')
      return `${d}/${m}/${y}`
    },
    async fetchData() {
      this.loading = true
      this.error = ''
      try {
        const res = await this.$axios.$get('/api/todos', { params: { from: this.range.start, to: this.range.end } })
        this.rows = (res && res.data) ? res.data.map(it => ({
          id: it.id,
          text: it.text,
          project: it.project,
          priority: it.priority,
          status: it.status,
          createdAt: it.createdAt,
          updatedAt: it.updatedAt
        })) : []
      } catch (e) {
        this.rows = []
        this.error = 'Không tải được dữ liệu.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.todo-month-table {
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: rgba(220, 222, 235, 0.45);
  backdrop-filter: blur(18px);
  box-shadow: 0 8px 32px rgba(44, 38, 76, 0.10);
  padding: 14px;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.title {
  font-weight: 900;
  color: rgba(31, 45, 61, 0.82);
}

.meta {
  font-weight: 800;
  font-size: 12px;
  color: rgba(31, 45, 61, 0.55);
}

.state {
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: rgba(31, 45, 61, 0.7);
  font-weight: 700;
}

.state.error {
  background: rgba(220, 53, 69, 0.10);
  border-color: rgba(220, 53, 69, 0.20);
  color: rgba(220, 53, 69, 0.9);
}

.table-wrap {
  overflow: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 860px;
  background: rgba(255, 255, 255, 0.18);
}

thead th {
  text-align: left;
  font-size: 12px;
  letter-spacing: 0.02em;
  color: rgba(31, 45, 61, 0.65);
  font-weight: 900;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.35);
  position: sticky;
  top: 0;
  background: rgba(230, 232, 244, 0.65);
  backdrop-filter: blur(18px);
}

tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.28);
  color: rgba(31, 45, 61, 0.82);
  font-weight: 700;
  font-size: 13px;
}

tbody tr:hover td {
  background: rgba(255, 255, 255, 0.18);
}

.mono {
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  color: rgba(31, 45, 61, 0.7);
}

.text {
  max-width: 420px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty {
  text-align: center;
  padding: 14px 12px;
  color: rgba(31, 45, 61, 0.6);
  font-weight: 800;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.18);
  font-size: 12px;
  font-weight: 900;
}

.pill.p-high {
  background: rgba(220, 53, 69, 0.10);
  border-color: rgba(220, 53, 69, 0.18);
  color: rgba(220, 53, 69, 0.95);
}

.pill.p-medium {
  background: rgba(255, 193, 7, 0.12);
  border-color: rgba(255, 193, 7, 0.22);
  color: rgba(124, 91, 10, 0.95);
}

.pill.p-low {
  background: rgba(40, 167, 69, 0.10);
  border-color: rgba(40, 167, 69, 0.18);
  color: rgba(40, 167, 69, 0.95);
}

.pill.s-open {
  background: rgba(102, 126, 234, 0.12);
  border-color: rgba(102, 126, 234, 0.22);
  color: rgba(64, 86, 190, 0.95);
}

.pill.s-progress {
  background: rgba(90, 200, 250, 0.14);
  border-color: rgba(90, 200, 250, 0.22);
  color: rgba(16, 106, 142, 0.95);
}

.pill.s-done {
  background: rgba(40, 167, 69, 0.12);
  border-color: rgba(40, 167, 69, 0.22);
  color: rgba(40, 167, 69, 0.95);
}

.pill.s-close {
  background: rgba(108, 117, 125, 0.14);
  border-color: rgba(108, 117, 125, 0.22);
  color: rgba(108, 117, 125, 0.95);
}

.pill.d-true {
  background: #28a745;
  border-color: #1f8a39;
  color: #ffffff;
}

.pill.d-false {
  background: #1f2430;
  border-color: #0f1218;
  color: #ffffff;
}

.pill.d-true i,
.pill.d-false i {
  font-size: 14px;
  line-height: 1;
}

.col-id {
  width: 90px;
}

.col-priority,
.col-status,
.col-done {
  width: 120px;
}

.col-created {
  width: 180px;
}
</style>
