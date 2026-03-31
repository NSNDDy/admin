<template>
  <div class="finance-page">
    <div class="finance-header">
      <h1><i class="fas fa-wallet mr-2"></i>Quản lý Tài chính cá nhân</h1>
      <div class="header-actions">
        <span class="badge badge-info p-2">{{ currentMonthName }}</span>
      </div>
    </div>

    <!-- Dashboard Summary -->
    <div class="summary-cards">
      <div class="glass-card summary-card income">
        <div class="label">Tổng Thu nhập</div>
        <div class="value">+{{ formatCurrency(totalIncome) }}</div>
      </div>
      <div class="glass-card summary-card expense">
        <div class="label">Tổng Chi tiêu</div>
        <div class="value">-{{ formatCurrency(totalExpense) }}</div>
      </div>
      <div class="glass-card summary-card balance">
        <div class="label">Số dư hiện tại</div>
        <div class="value">{{ formatCurrency(balance) }}</div>
      </div>
    </div>

    <div class="finance-grid">
      <!-- Main Content: Chart & History -->
      <div class="main-content">
        <!-- Cash Flow Chart -->
        <div class="glass-card mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="m-0"><i class="fas fa-chart-line mr-2"></i>Biểu đồ dòng tiền</h5>
          </div>
          <div class="chart-container">
            <canvas id="cashFlowChart"></canvas>
          </div>
        </div>

        <!-- Transaction History -->
        <div class="glass-card">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="m-0"><i class="fas fa-history mr-2"></i>Lịch sử giao dịch</h5>
          </div>
          <div class="transaction-list">
            <table class="transaction-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Danh mục</th>
                  <th>Mô tả</th>
                  <th>Số tiền</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in transactions" :key="t.id">
                  <td>{{ formatDate(t.date) }}</td>
                  <td>
                    <span class="type-badge" :class="t.type.toLowerCase()">
                      {{ t.category }}
                    </span>
                  </td>
                  <td>{{ t.description || '-' }}</td>
                  <td :class="t.type === 'INCOME' ? 'text-success' : 'text-danger'">
                    {{ t.type === 'INCOME' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
                  </td>
                  <td>
                    <button @click="editTransaction(t)" class="btn btn-sm btn-link text-white p-0 mr-2">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="deleteTransaction(t.id)" class="btn btn-sm btn-link text-danger p-0">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="transactions.length === 0">
                  <td colspan="5" class="text-center opacity-50 py-4">Chưa có giao dịch nào</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Sidebar: Add/Edit Form -->
      <div class="sidebar-content">
        <div class="glass-card">
          <h5><i class="fas fa-plus-circle mr-2"></i>{{ editingId ? 'Cập nhật' : 'Thêm giao dịch' }}</h5>
          <form @submit.prevent="saveTransaction" class="finance-form mt-3">
            <div class="form-group">
              <label>Loại giao dịch</label>
              <GlassSelect
                v-model="form.type"
                :options="typeOptions"
                placeholder="Chọn loại"
              />
            </div>
            <div class="form-group">
              <label>Danh mục</label>
              <GlassSelect
                v-model="form.category"
                :options="form.type === 'INCOME' ? incomeCategories : expenseCategories"
                placeholder="Chọn danh mục"
              />
            </div>
            <div class="form-group">
              <label>Số tiền (VNĐ)</label>
              <input 
                v-model.number="form.amount" 
                type="number" 
                class="glass-input" 
                placeholder="Nhập số tiền..."
                required
              >
            </div>
            <div class="form-group">
              <label>Ngày</label>
              <input 
                v-model="form.date" 
                type="date" 
                class="glass-input" 
                required
              >
            </div>
            <div class="form-group">
              <label>Mô tả</label>
              <textarea 
                v-model="form.description" 
                class="glass-input" 
                rows="3" 
                placeholder="Ghi chú thêm..."
              ></textarea>
            </div>
            <button type="submit" class="btn-save">
              {{ editingId ? 'LƯU THAY ĐỔI' : 'THÊM GIAO DỊCH' }}
            </button>
            <button v-if="editingId" type="button" @click="resetForm" class="btn btn-sm btn-outline-light mt-2">
              Hủy bỏ
            </button>
          </form>
        </div>

        <!-- Savings Goals -->
        <div class="glass-card mt-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="m-0"><i class="fas fa-piggy-bank mr-2"></i>Tiết kiệm & Đầu tư</h5>
            <button @click="showGoalForm = !showGoalForm" class="btn btn-sm btn-link text-white p-0">
              <i class="fas" :class="showGoalForm ? 'fa-times' : 'fa-plus'"></i>
            </button>
          </div>

          <!-- Add Goal Form -->
          <div v-if="showGoalForm" class="goal-form mb-4 p-3 rounded" style="background: rgba(255,255,255,0.05)">
            <div class="form-group mb-2">
              <input v-model="newGoal.name" type="text" class="glass-input w-100" placeholder="Tên mục tiêu...">
            </div>
            <div class="form-group mb-2 d-flex gap-2">
              <input v-model.number="newGoal.targetAmount" type="number" class="glass-input flex-grow-1" placeholder="Mục tiêu">
              <input v-model.number="newGoal.currentAmount" type="number" class="glass-input flex-grow-1" placeholder="Hiện có">
            </div>
            <div class="form-group mb-2">
              <GlassSelect v-model="newGoal.type" :options="goalTypeOptions" placeholder="Loại" />
            </div>
            <button @click="saveGoal" class="btn-save w-100 py-1" style="font-size: 12px">LƯU MỤC TIÊU</button>
          </div>

          <div v-for="goal in goals" :key="goal.id" class="mt-3">
            <div class="d-flex justify-content-between mb-1">
              <small>{{ goal.name }} ({{ goal.type === 'SAVINGS' ? 'Tiết kiệm' : 'Đầu tư' }})</small>
              <div class="d-flex align-items-center">
                <small class="mr-2">{{ calculateProgress(goal) }}%</small>
                <button @click="deleteGoal(goal.id)" class="btn btn-sm btn-link text-danger p-0" style="font-size: 10px">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="progress" style="height: 8px; background: rgba(255,255,255,0.1);">
              <div class="progress-bar" :class="goal.type === 'SAVINGS' ? 'bg-info' : 'bg-success'" :style="{ width: calculateProgress(goal) + '%' }"></div>
            </div>
            <div class="d-flex justify-content-between mt-1">
              <small style="font-size: 10px; opacity: 0.6">{{ formatCurrency(goal.currentAmount) }} / {{ formatCurrency(goal.targetAmount) }}</small>
            </div>
          </div>
          <div v-if="goals.length === 0 && !showGoalForm" class="text-center opacity-50 py-3" style="font-size: 13px">
            Chưa có mục tiêu nào
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GlassSelect from '~/components/GlassSelect.vue';

export default {
  layout: 'default',
  components: { GlassSelect },
  data() {
    return {
      transactions: [],
      goals: [],
      showGoalForm: false,
      editingId: null,
      form: {
        type: 'EXPENSE',
        category: '',
        amount: '',
        date: new Date().toISOString().substr(0, 10),
        description: ''
      },
      newGoal: {
        name: '',
        targetAmount: '',
        currentAmount: '',
        type: 'SAVINGS'
      },
      typeOptions: [
        { label: 'Chi tiêu', value: 'EXPENSE' },
        { label: 'Thu nhập', value: 'INCOME' }
      ],
      goalTypeOptions: [
        { label: 'Tiết kiệm', value: 'SAVINGS' },
        { label: 'Đầu tư', value: 'INVESTMENT' }
      ],
      incomeCategories: [
        { label: 'Lương', value: 'Salary' },
        { label: 'Thưởng', value: 'Bonus' },
        { label: 'Đầu tư', value: 'Investment' },
        { label: 'Khác', value: 'Other' }
      ],
      expenseCategories: [
        { label: 'Ăn uống', value: 'Food' },
        { label: 'Di chuyển', value: 'Transport' },
        { label: 'Nhà cửa', value: 'Rent' },
        { label: 'Mua sắm', value: 'Shopping' },
        { label: 'Giải trí', value: 'Entertainment' },
        { label: 'Sức khỏe', value: 'Health' },
        { label: 'Khác', value: 'Other' }
      ],
      chart: null
    };
  },
  computed: {
    currentMonthName() {
      return new Date().toLocaleString('vi-VN', { month: 'long', year: 'numeric' });
    },
    totalIncome() {
      return this.transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);
    },
    totalExpense() {
      return this.transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);
    },
    balance() {
      return this.totalIncome - this.totalExpense;
    }
  },
  mounted() {
    this.fetchData();
    this.initChart();
  },
  methods: {
    async fetchData() {
      await Promise.all([
        this.fetchTransactions(),
        this.fetchGoals()
      ]);
    },
    async fetchTransactions() {
      try {
        const res = await this.$axios.$get('/api/finance/transactions');
        this.transactions = res.data;
        this.updateChart();
      } catch (err) {
        console.error('Fetch transactions error:', err);
      }
    },
    async fetchGoals() {
      try {
        const res = await this.$axios.$get('/api/finance/goals');
        this.goals = res.data;
      } catch (err) {
        console.error('Fetch goals error:', err);
      }
    },
    async saveTransaction() {
      try {
        if (this.editingId) {
          await this.$axios.$put(`/api/finance/transactions/${this.editingId}`, this.form);
        } else {
          await this.$axios.$post('/api/finance/transactions', this.form);
        }
        this.resetForm();
        this.fetchTransactions();
      } catch (err) {
        alert('Lỗi khi lưu giao dịch: ' + (err.response?.data?.message || err.message));
      }
    },
    async saveGoal() {
      try {
        await this.$axios.$post('/api/finance/goals', this.newGoal);
        this.newGoal = { name: '', targetAmount: '', currentAmount: '', type: 'SAVINGS' };
        this.showGoalForm = false;
        this.fetchGoals();
      } catch (err) {
        alert('Lỗi khi lưu mục tiêu');
      }
    },
    async deleteGoal(id) {
      if (!confirm('Xóa mục tiêu này?')) return;
      try {
        await this.$axios.$delete(`/api/finance/goals/${id}`);
        this.fetchGoals();
      } catch (err) {
        alert('Lỗi khi xóa mục tiêu');
      }
    },
    calculateProgress(goal) {
      if (!goal.targetAmount || goal.targetAmount === 0) return 0;
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      return Math.min(Math.round(progress), 100);
    },
    async deleteTransaction(id) {
      if (!confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) return;
      try {
        await this.$axios.$delete(`/api/finance/transactions/${id}`);
        this.fetchTransactions();
      } catch (err) {
        alert('Lỗi khi xóa giao dịch');
      }
    },
    editTransaction(t) {
      this.editingId = t.id;
      this.form = {
        type: t.type,
        category: t.category,
        amount: t.amount,
        date: t.date,
        description: t.description
      };
    },
    resetForm() {
      this.editingId = null;
      this.form = {
        type: 'EXPENSE',
        category: '',
        amount: '',
        date: new Date().toISOString().substr(0, 10),
        description: ''
      };
    },
    formatCurrency(val) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    },
    formatDate(dateStr) {
      const d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    },
    initChart() {
      if (typeof Chart === 'undefined') {
        setTimeout(this.initChart, 100);
        return;
      }
      const ctx = document.getElementById('cashFlowChart').getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Thu nhập', 'Chi tiêu'],
          datasets: [{
            label: 'VNĐ',
            data: [0, 0],
            backgroundColor: ['rgba(74, 222, 128, 0.5)', 'rgba(248, 113, 113, 0.5)'],
            borderColor: ['#4ade80', '#f87171'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: 'white' }
            },
            x: {
              ticks: { color: 'white' }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    },
    updateChart() {
      if (!this.chart) return;
      this.chart.data.datasets[0].data = [this.totalIncome, this.totalExpense];
      this.chart.update();
    }
  }
};
</script>

<style scoped>
/* Scoped overrides if needed */
.progress { border-radius: 10px; }
</style>
