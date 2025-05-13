// ------------------------
// Save Expense Logic
// ------------------------

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

document.getElementById('expenseForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;
  const note = document.getElementById('note').value;

  if (!amount || !category || !date) {
    alert('Please fill in all required fields.');
    return;
  }

  const newExpense = { amount, category, date, note, id: Date.now() };

  expenses.push(newExpense);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  e.target.reset();

  renderCharts();
});

// ------------------------
// Chart.js Setup
// ------------------------

let pieChart, barChart;

function renderCharts() {
  const data = JSON.parse(localStorage.getItem('expenses')) || [];

  // --- PIE CHART: Group by category ---
  const categoryTotals = {};
  data.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const pieLabels = Object.keys(categoryTotals);
  const pieData = Object.values(categoryTotals);

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(document.getElementById('pieChart'), {
    type: 'pie',
    data: {
      labels: pieLabels,
      datasets: [{
        data: pieData,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8e44ad', '#2ecc71']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });

  // --- BAR CHART: Group by date ---
  const dateTotals = {};
  data.forEach(exp => {
    dateTotals[exp.date] = (dateTotals[exp.date] || 0) + exp.amount;
  });

  const barLabels = Object.keys(dateTotals).sort();
  const barData = barLabels.map(date => dateTotals[date]);

  if (barChart) barChart.destroy();
  barChart = new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: barLabels,
      datasets: [{
        label: 'Daily Expenses',
        data: barData,
        backgroundColor: '#36A2EB'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Initial load
renderCharts();

// Render expense table
function renderTable(filtered = expenses) {
  const tbody = document.querySelector('#expenseTable tbody');
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    const row = `<tr><td colspan="4" style="text-align:center;">No expenses found.</td></tr>`;
    tbody.innerHTML = row;
    return;
  }

  filtered.forEach(exp => {
    const row = `
      <tr>
        <td>${exp.date}</td>
        <td>${exp.category}</td>
        <td>$${exp.amount.toFixed(2)}</td>
        <td>${exp.note || '-'}</td>
      </tr>`;
    tbody.innerHTML += row;
  });
}

// Date range filtering
document.getElementById('filterBtn').addEventListener('click', () => {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;

  let filtered = expenses;

  if (start && end) {
    filtered = expenses.filter(exp => exp.date >= start && exp.date <= end);
  }

  renderTable(filtered);
});

// Clear all expenses
document.getElementById('clearAllBtn').addEventListener('click', () => {
  if (confirm("Are you sure you want to delete all expenses?")) {
    localStorage.removeItem('expenses');
    expenses = [];
    renderCharts();
    renderTable([]);
  }
});
