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

function renderCharts(filteredData = null) {
  const data = filteredData || JSON.parse(localStorage.getItem('expenses')) || [];
  expenses = data;

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

  renderTable(data);
}

// ------------------------
// Render Expense Table
// ------------------------

function renderTable(filtered = expenses) {
  const tbody = document.querySelector('#expenseTable tbody');
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    const row = `<tr><td colspan="4" style="text-align:center;">No expenses found.</td></tr>`;
    tbody.innerHTML = row;
    animateTotalAmount(0);
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

  const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);
  animateTotalAmount(total);
}

// ------------------------
// Animated Total Counter
// ------------------------

function animateTotalAmount(amount) {
  const el = document.getElementById('totalAmount');
  const duration = 500;
  const start = parseFloat(el.textContent) || 0;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = start + (amount - start) * progress;
    el.textContent = value.toFixed(2);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ------------------------
// Filter by Date Range
// ------------------------

document.getElementById('filterBtn').addEventListener('click', () => {
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;

  let filtered = expenses;

  if (start) {
    filtered = filtered.filter(exp => exp.date >= start);
  }
  if (end) {
    filtered = filtered.filter(exp => exp.date <= end);
  }

  renderCharts(filtered);
});

// ------------------------
// Clear All Button
// ------------------------

document.getElementById('clearAllBtn').addEventListener('click', () => {
  if (confirm("Are you sure you want to delete all expenses?")) {
    localStorage.removeItem('expenses');
    expenses = [];
    renderCharts();
  }
});

// ------------------------
// Export to CSV
// ------------------------

document.getElementById('exportBtn').addEventListener('click', () => {
  if (expenses.length === 0) {
    alert("No expenses to export.");
    return;
  }

  const headers = ['Date', 'Category', 'Amount', 'Note'];
  const rows = expenses.map(exp =>
    [exp.date, exp.category, exp.amount.toFixed(2), `"${exp.note || ''}"`]
  );

  let csvContent = "data:text/csv;charset=utf-8,"
    + headers.join(",") + "\n"
    + rows.map(r => r.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "expenses.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Initial Load
renderCharts();
