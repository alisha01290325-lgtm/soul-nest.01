const STORE_KEY = "soulNestRecordsV2";
const OLD_STORE_KEY = "soulNestRecordsV1";
const ITEM_KEY = "soulNestItemsV2";
const OLD_ITEM_KEY = "soulNestItemsV1";
const COLUMN_KEY = "soulNestColumnsV1";

function uuid() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const categories = [
  "儀式",
  "塔羅",
  "讀心 / 通靈",
  "聖物 / 飾品",
  "代理商",
  "其他收入",
  "成本支出"
];

const defaultColumns = [
  { id: "date", label: "日期", visible: true },
  { id: "category", label: "分類", visible: true },
  { id: "item", label: "品項", visible: true },
  { id: "customer", label: "客人 / 來源", visible: true },
  { id: "paymentStatus", label: "付款狀態", visible: true },
  { id: "paymentMethod", label: "付款方式", visible: true },
  { id: "paidDate", label: "付款日期", visible: false },
  { id: "price", label: "單價", visible: true },
  { id: "qty", label: "數量", visible: true },
  { id: "amount", label: "總金額", visible: true },
  { id: "cost", label: "成本", visible: true },
  { id: "profit", label: "淨利", visible: true },
  { id: "note", label: "備註", visible: true }
];

const defaultItems = [
  { id: uuid(), name: "塔羅牌一題", category: "塔羅", price: 200, cost: 0 },
  { id: uuid(), name: "塔羅牌四題", category: "塔羅", price: 990, cost: 0 },
  { id: uuid(), name: "塔羅牌緊急加購", category: "塔羅", price: 100, cost: 0 },
  { id: uuid(), name: "塔羅夜間加乘15m", category: "塔羅", price: 300, cost: 0 },
  { id: uuid(), name: "讀心術一題", category: "讀心 / 通靈", price: 250, cost: 100 },
  { id: uuid(), name: "讀心術四題", category: "讀心 / 通靈", price: 990, cost: 600 },
  { id: uuid(), name: "席琳師傅－算命7題", category: "讀心 / 通靈", price: 1600, cost: 1000 },
  { id: uuid(), name: "感情儀式", category: "儀式", price: 3000, cost: 1500 },
  { id: uuid(), name: "招財儀式", category: "儀式", price: 3000, cost: 1500 },
  { id: uuid(), name: "客制水晶", category: "聖物 / 飾品", price: 0, cost: 0 },
  { id: uuid(), name: "水晶耳環", category: "聖物 / 飾品", price: 0, cost: 0 },
  { id: uuid(), name: "林昱－席琳師傅儀式", category: "代理商", price: 500, cost: 0 },
  { id: uuid(), name: "成本支出", category: "成本支出", price: 0, cost: 0 }
];

const defaultRecords = [
  {
    id: uuid(), date: "2026-07-06", category: "儀式", item: "感情儀式", customer: "庚琳",
    paymentStatus: "已收款", paymentMethod: "轉帳", paidDate: "2026-07-06", price: 3000, qty: 2, cost: 3000,
    note: "範例：儀式收入"
  },
  {
    id: uuid(), date: "2026-07-08", category: "塔羅", item: "塔羅牌一題", customer: "翊甄",
    paymentStatus: "已收款", paymentMethod: "LINE Pay", paidDate: "2026-07-08", price: 200, qty: 1, cost: 0,
    note: "範例：單題"
  },
  {
    id: uuid(), date: "2026-07-09", category: "讀心 / 通靈", item: "讀心術一題", customer: "暱稱A",
    paymentStatus: "未收款", paymentMethod: "尚未付款", paidDate: "", price: 250, qty: 9, cost: 900,
    note: "範例：尚未收款"
  },
  {
    id: uuid(), date: "2026-07-07", category: "代理商", item: "林昱－席琳師傅儀式", customer: "林昱",
    paymentStatus: "已收款", paymentMethod: "轉帳", paidDate: "2026-07-07", price: 500, qty: 1, cost: 0,
    note: "範例：代理商"
  },
  {
    id: uuid(), date: "2026-08-03", category: "塔羅", item: "塔羅牌四題", customer: "IG客人B",
    paymentStatus: "已收款", paymentMethod: "轉帳", paidDate: "2026-08-03", price: 990, qty: 3, cost: 0,
    note: "範例：跨月份資料"
  }
];

let records = loadWithMigration(STORE_KEY, OLD_STORE_KEY, defaultRecords);
let items = loadWithMigration(ITEM_KEY, OLD_ITEM_KEY, defaultItems);
let columns = loadColumns();
let activePage = "dashboard";

const $ = (id) => document.getElementById(id);

function loadWithMigration(newKey, oldKey, fallback) {
  try {
    const raw = localStorage.getItem(newKey) || localStorage.getItem(oldKey);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.warn("資料讀取失敗，已使用預設資料", error);
    return fallback;
  }
}

function loadColumns() {
  try {
    const raw = localStorage.getItem(COLUMN_KEY);
    if (!raw) return cloneDefaultColumns();
    const parsed = JSON.parse(raw);
    return normalizeColumns(parsed);
  } catch (error) {
    console.warn("欄位設定讀取失敗，已使用預設欄位", error);
    return cloneDefaultColumns();
  }
}

function cloneDefaultColumns() {
  return defaultColumns.map((column) => ({ ...column }));
}

function normalizeColumns(input) {
  if (!Array.isArray(input)) return cloneDefaultColumns();
  const defaultMap = new Map(defaultColumns.map((column) => [column.id, column]));
  const normalized = input
    .filter((column) => defaultMap.has(column.id))
    .map((column) => {
      const base = defaultMap.get(column.id);
      return {
        id: base.id,
        label: String(column.label || base.label),
        visible: typeof column.visible === "boolean" ? column.visible : base.visible
      };
    });

  defaultColumns.forEach((base) => {
    if (!normalized.some((column) => column.id === base.id)) {
      normalized.push({ ...base });
    }
  });

  if (!normalized.some((column) => column.visible)) {
    const first = normalized[0];
    if (first) first.visible = true;
  }
  return normalized;
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(records));
  localStorage.setItem(ITEM_KEY, JSON.stringify(items));
  localStorage.setItem(COLUMN_KEY, JSON.stringify(columns));
}

function money(value) {
  const num = Number(value || 0);
  return num.toLocaleString("zh-TW", { style: "currency", currency: "TWD", maximumFractionDigits: 0 });
}

function monthKey(dateText) {
  return (dateText || "").slice(0, 7);
}

function yearKey(dateText) {
  return (dateText || "").slice(0, 4);
}

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function currentYear() {
  return todayISO().slice(0, 4);
}

function currentMonthNumber() {
  return todayISO().slice(5, 7);
}

function amountOf(record) {
  if (record.category === "成本支出") return 0;
  return Number(record.price || 0) * Number(record.qty || 1);
}

function costOf(record) {
  return Number(record.cost || 0);
}

function profitOf(record) {
  if (record.category === "成本支出") return -costOf(record);
  return amountOf(record) - costOf(record);
}

function summaryOf(list) {
  return {
    revenue: list.reduce((sum, record) => sum + amountOf(record), 0),
    cost: list.reduce((sum, record) => sum + costOf(record), 0),
    profit: list.reduce((sum, record) => sum + profitOf(record), 0),
    unpaid: list.reduce((sum, record) => sum + (record.paymentStatus === "未收款" ? amountOf(record) : 0), 0),
    paid: list.reduce((sum, record) => sum + (record.paymentStatus === "已收款" ? amountOf(record) : 0), 0),
    count: list.length
  };
}

function selectedYear() {
  return $("yearFilter")?.value || currentYear();
}

function selectedMonth() {
  return $("monthFilter")?.value || "all";
}

function selectedPeriodLabel() {
  const year = selectedYear();
  const month = selectedMonth();
  if (month === "all") return `${year} 全年`;
  return `${year} 年 ${Number(month)} 月`;
}

function recordsInSelectedPeriod() {
  const year = selectedYear();
  const month = selectedMonth();
  return records.filter((record) => {
    if (yearKey(record.date) !== year) return false;
    if (month === "all") return true;
    return monthKey(record.date) === `${year}-${month}`;
  });
}

function filteredRecords() {
  const periodRecords = recordsInSelectedPeriod();
  const keyword = ($("searchInput")?.value || "").trim().toLowerCase();
  const category = $("categoryFilter")?.value || "all";
  const status = $("statusFilter")?.value || "all";

  return periodRecords.filter((record) => {
    const text = `${record.item} ${record.customer} ${record.note} ${record.category} ${record.paymentMethod} ${record.paidDate}`.toLowerCase();
    const matchKeyword = !keyword || text.includes(keyword);
    const matchCategory = category === "all" || record.category === category;
    const matchStatus = status === "all" || record.paymentStatus === status;
    return matchKeyword && matchCategory && matchStatus;
  }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

function availableYears() {
  const years = new Set(records.map((record) => yearKey(record.date)).filter(Boolean));
  years.add(currentYear());
  return [...years].sort((a, b) => b.localeCompare(a));
}

function visibleColumns() {
  return columns.filter((column) => column.visible);
}

function render() {
  save();
  renderDateFilters();
  renderCategoryOptions();
  renderDatalist();
  renderDashboard();
  renderRecords();
  renderMonthly();
  renderSettings();
}

function renderDateFilters() {
  const yearSelect = $("yearFilter");
  const monthSelect = $("monthFilter");
  if (!yearSelect || !monthSelect) return;

  const currentSelectedYear = yearSelect.value || currentYear();
  const currentSelectedMonth = monthSelect.value || currentMonthNumber();
  const years = availableYears();

  yearSelect.innerHTML = years.map((year) => `<option value="${year}">${year} 年</option>`).join("");
  yearSelect.value = years.includes(currentSelectedYear) ? currentSelectedYear : currentYear();

  monthSelect.innerHTML = `<option value="all">全年</option>` + Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    return `<option value="${month}">${index + 1} 月</option>`;
  }).join("");
  monthSelect.value = [...monthSelect.options].some((option) => option.value === currentSelectedMonth) ? currentSelectedMonth : "all";
}

function renderCategoryOptions() {
  const selects = [$("categoryInput"), $("categoryFilter"), $("itemCategoryInput")].filter(Boolean);
  selects.forEach((select) => {
    const current = select.value;
    if (select.id === "categoryFilter") {
      select.innerHTML = `<option value="all">全部分類</option>` + categories.map((category) => `<option value="${category}">${category}</option>`).join("");
    } else {
      select.innerHTML = categories.map((category) => `<option value="${category}">${category}</option>`).join("");
    }
    if ([...select.options].some((option) => option.value === current)) select.value = current;
  });
}

function renderDatalist() {
  $("itemOptions").innerHTML = items.map((item) => `<option value="${escapeHtml(item.name)}"></option>`).join("");
}

function renderDashboard() {
  const periodRecords = recordsInSelectedPeriod();
  const period = summaryOf(periodRecords);
  const all = summaryOf(records);

  $("periodTitle").textContent = `${selectedPeriodLabel()} 儀表板`;
  $("periodRevenueLabel").textContent = selectedMonth() === "all" ? "全年總金額" : "本月總金額";
  $("sumRevenue").textContent = money(period.revenue);
  $("sumCost").textContent = money(period.cost);
  $("sumProfit").textContent = money(period.profit);
  $("sumUnpaid").textContent = money(period.unpaid);
  $("sumPaid").textContent = money(period.paid);
  $("sumCount").textContent = String(period.count);
  $("allRevenue").textContent = money(all.revenue);
  $("allProfit").textContent = money(all.profit);

  renderCategorySummary(periodRecords);
  renderTrendSummary();
  renderRecentRows(periodRecords);
  renderAllTimeSummary(all);
}

function renderCategorySummary(periodRecords) {
  const byCategory = categories.map((category) => {
    const list = periodRecords.filter((record) => record.category === category);
    return { category, ...summaryOf(list) };
  }).filter((row) => row.count > 0);

  $("categorySummary").innerHTML = byCategory.length
    ? byCategory.map((row) => `
      <div class="summary-item">
        <div>
          <strong>${escapeHtml(row.category)}</strong>
          <small>${row.count} 筆｜成本 ${money(row.cost)}</small>
        </div>
        <div class="summary-number">
          <strong>${money(row.revenue)}</strong>
          <small class="${row.profit >= 0 ? "profit-pos" : "profit-neg"}">淨利 ${money(row.profit)}</small>
        </div>
      </div>`).join("")
    : `<p class="muted">這個期間還沒有資料。</p>`;
}

function renderTrendSummary() {
  const year = selectedYear();
  const rows = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    const list = records.filter((record) => monthKey(record.date) === `${year}-${month}`);
    return { month, ...summaryOf(list) };
  });
  const maxRevenue = Math.max(1, ...rows.map((row) => row.revenue));

  $("trendSummary").innerHTML = rows.map((row) => {
    const width = Math.max(3, Math.round((row.revenue / maxRevenue) * 100));
    return `
      <div class="trend-row">
        <div class="trend-label">${Number(row.month)} 月</div>
        <div class="trend-bar-wrap"><div class="trend-bar" style="width:${width}%"></div></div>
        <div class="trend-money">
          <strong>${money(row.revenue)}</strong>
          <small class="${row.profit >= 0 ? "profit-pos" : "profit-neg"}">淨利 ${money(row.profit)}</small>
        </div>
      </div>`;
  }).join("");
}

function renderRecentRows(periodRecords) {
  const recent = [...periodRecords].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 8);
  $("recentRows").innerHTML = recent.length ? recent.map((record) => `
    <tr>
      <td>${escapeHtml(record.date || "")}</td>
      <td>${escapeHtml(record.item || "")}</td>
      <td>${escapeHtml(record.customer || "")}</td>
      <td>${money(amountOf(record))}</td>
      <td>${statusBadge(record.paymentStatus)}</td>
    </tr>
  `).join("") : `<tr><td colspan="5" class="muted">尚無資料</td></tr>`;
}

function renderAllTimeSummary(all) {
  const sortedDates = records.map((record) => record.date).filter(Boolean).sort();
  const firstDate = sortedDates[0] || "尚無";
  const latestDate = sortedDates[sortedDates.length - 1] || "尚無";
  const avg = all.count ? Math.round(all.revenue / all.count) : 0;
  $("allTimeSummary").innerHTML = `
    <div class="summary-item"><strong>全部總金額</strong><span>${money(all.revenue)}</span></div>
    <div class="summary-item"><strong>全部成本 / 支出</strong><span>${money(all.cost)}</span></div>
    <div class="summary-item"><strong>全部淨利</strong><span class="${all.profit >= 0 ? "profit-pos" : "profit-neg"}">${money(all.profit)}</span></div>
    <div class="summary-item"><strong>全部未收款</strong><span>${money(all.unpaid)}</span></div>
    <div class="summary-item"><strong>平均每筆收入</strong><span>${money(avg)}</span></div>
    <div class="summary-item"><strong>資料區間</strong><span>${escapeHtml(firstDate)} ～ ${escapeHtml(latestDate)}</span></div>
  `;
}

function renderRecords() {
  const list = filteredRecords();
  const displayColumns = visibleColumns();
  const colspan = displayColumns.length + 1;

  $("recordTableHead").innerHTML = `
    <tr>
      ${displayColumns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}
      <th></th>
    </tr>`;

  $("recordRows").innerHTML = list.length ? list.map((record) => `
    <tr>
      ${displayColumns.map((column) => {
        const cell = recordCell(record, column.id);
        return `<td class="${cell.className}">${cell.html}</td>`;
      }).join("")}
      <td class="row-actions"><button class="tiny-btn" onclick="openRecordDialog('${record.id}')">編輯</button></td>
    </tr>
  `).join("") : `<tr><td colspan="${colspan}" class="muted">目前沒有符合條件的資料。</td></tr>`;
}

function recordCell(record, fieldId) {
  switch (fieldId) {
    case "date":
      return { html: escapeHtml(record.date || ""), className: "" };
    case "category":
      return { html: escapeHtml(record.category || ""), className: "" };
    case "item":
      return { html: escapeHtml(record.item || ""), className: "" };
    case "customer":
      return { html: escapeHtml(record.customer || ""), className: "" };
    case "paymentStatus":
      return { html: statusBadge(record.paymentStatus), className: "" };
    case "paymentMethod":
      return { html: escapeHtml(record.paymentMethod || ""), className: "" };
    case "paidDate":
      return { html: escapeHtml(record.paidDate || ""), className: "" };
    case "price":
      return { html: money(record.price), className: "" };
    case "qty":
      return { html: String(Number(record.qty || 1)), className: "" };
    case "amount":
      return { html: money(amountOf(record)), className: "" };
    case "cost":
      return { html: money(costOf(record)), className: "" };
    case "profit":
      return { html: money(profitOf(record)), className: profitOf(record) >= 0 ? "profit-pos" : "profit-neg" };
    case "note":
      return { html: escapeHtml(record.note || ""), className: "" };
    default:
      return { html: "", className: "" };
  }
}

function recordCellText(record, fieldId) {
  switch (fieldId) {
    case "date": return record.date || "";
    case "category": return record.category || "";
    case "item": return record.item || "";
    case "customer": return record.customer || "";
    case "paymentStatus": return record.paymentStatus || "";
    case "paymentMethod": return record.paymentMethod || "";
    case "paidDate": return record.paidDate || "";
    case "price": return record.price || 0;
    case "qty": return record.qty || 1;
    case "amount": return amountOf(record);
    case "cost": return costOf(record);
    case "profit": return profitOf(record);
    case "note": return record.note || "";
    default: return "";
  }
}

function renderMonthly() {
  const year = selectedYear();
  const rows = Array.from({ length: 12 }, (_, index) => `${year}-${String(index + 1).padStart(2, "0")}`);
  $("monthlyRows").innerHTML = rows.map((m) => {
    const list = records.filter((record) => monthKey(record.date) === m);
    const row = summaryOf(list);
    return `
      <tr>
        <td>${m}</td>
        <td>${money(row.revenue)}</td>
        <td>${money(row.cost)}</td>
        <td class="${row.profit >= 0 ? "profit-pos" : "profit-neg"}">${money(row.profit)}</td>
        <td>${money(row.paid)}</td>
        <td>${money(row.unpaid)}</td>
        <td>${row.count}</td>
      </tr>`;
  }).join("");
}

function renderSettings() {
  $("itemList").innerHTML = items.length ? items.map((item) => `
    <div class="setting-item">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <small class="muted">${escapeHtml(item.category)}</small>
      </div>
      <span>${money(item.price)}</span>
      <span>成本 ${money(item.cost)}</span>
      <button class="tiny-btn" onclick="deleteItem('${item.id}')">刪除</button>
    </div>
  `).join("") : `<p class="muted">尚未設定品項。</p>`;
  renderColumnSettings();
}

function renderColumnSettings() {
  const list = $("columnSettingsList");
  if (!list) return;
  list.innerHTML = columns.map((column, index) => `
    <div class="column-setting-item">
      <label class="check-line">
        <input type="checkbox" ${column.visible ? "checked" : ""} onchange="toggleColumnVisibility('${column.id}', this.checked)" />
        顯示
      </label>
      <input type="text" value="${escapeHtml(column.label)}" oninput="renameColumn('${column.id}', this.value)" aria-label="${escapeHtml(column.label)} 欄位名稱" />
      <div class="column-buttons">
        <button class="tiny-btn" onclick="moveColumn('${column.id}', -1)" ${index === 0 ? "disabled" : ""}>上移</button>
        <button class="tiny-btn" onclick="moveColumn('${column.id}', 1)" ${index === columns.length - 1 ? "disabled" : ""}>下移</button>
      </div>
    </div>
  `).join("");
}

function statusBadge(status) {
  const paid = status === "已收款";
  return `<span class="badge ${paid ? "paid" : "unpaid"}">${paid ? "已收款" : "未收款"}</span>`;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openPage(page) {
  activePage = page;
  document.querySelectorAll(".page").forEach((section) => section.classList.toggle("active", section.id === page));
  document.querySelectorAll(".nav-btn").forEach((button) => button.classList.toggle("active", button.dataset.page === page));
  const titleMap = { dashboard: "儀表板", records: "記帳明細", monthly: "月報表", settings: "系統設定" };
  $("pageTitle").textContent = titleMap[page] || "Soul Nest 記帳系統";
}

function openRecordDialog(id = "") {
  const record = id ? records.find((item) => item.id === id) : null;
  $("recordModalTitle").textContent = record ? "編輯記帳" : "新增記帳";
  $("recordId").value = record?.id || "";
  $("dateInput").value = record?.date || todayISO();
  $("categoryInput").value = record?.category || "塔羅";
  $("itemInput").value = record?.item || "";
  $("customerInput").value = record?.customer || "";
  $("paymentStatusInput").value = record?.paymentStatus || "已收款";
  $("paymentMethodInput").value = record?.paymentMethod || "轉帳";
  $("paidDateInput").value = record?.paidDate || (record?.paymentStatus === "已收款" ? record?.date : todayISO());
  $("priceInput").value = record?.price ?? 0;
  $("qtyInput").value = record?.qty ?? 1;
  $("costInput").value = record?.cost ?? 0;
  $("noteInput").value = record?.note || "";
  $("deleteRecordBtn").classList.toggle("hidden", !record);
  updatePreview();
  $("recordDialog").showModal();
}

function closeRecordDialog() {
  $("recordDialog").close();
}

function updatePreview() {
  const category = $("categoryInput").value;
  const price = Number($("priceInput").value || 0);
  const qty = Number($("qtyInput").value || 1);
  const cost = Number($("costInput").value || 0);
  const amount = category === "成本支出" ? 0 : price * qty;
  const profit = category === "成本支出" ? -cost : amount - cost;
  $("previewAmount").textContent = money(amount);
  $("previewProfit").textContent = money(profit);
}

function syncItemPreset() {
  const name = $("itemInput").value.trim();
  const item = items.find((entry) => entry.name === name);
  if (!item) return;
  $("categoryInput").value = item.category;
  $("priceInput").value = item.price;
  $("costInput").value = item.cost;
  updatePreview();
}

function submitRecord(event) {
  event.preventDefault();
  const id = $("recordId").value || uuid();
  const next = {
    id,
    date: $("dateInput").value,
    category: $("categoryInput").value,
    item: $("itemInput").value.trim(),
    customer: $("customerInput").value.trim(),
    paymentStatus: $("paymentStatusInput").value,
    paymentMethod: $("paymentMethodInput").value,
    paidDate: $("paidDateInput").value,
    price: Number($("priceInput").value || 0),
    qty: Number($("qtyInput").value || 1),
    cost: Number($("costInput").value || 0),
    note: $("noteInput").value.trim()
  };

  const exists = records.some((record) => record.id === id);
  records = exists ? records.map((record) => record.id === id ? next : record) : [next, ...records];
  closeRecordDialog();
  openPage("records");
  render();
}

function deleteCurrentRecord() {
  const id = $("recordId").value;
  if (!id) return;
  if (!confirm("確定要刪除這筆記帳嗎？")) return;
  records = records.filter((record) => record.id !== id);
  closeRecordDialog();
  render();
}

function deleteItem(id) {
  if (!confirm("確定要刪除這個品項設定嗎？已建立的記帳資料不會被刪除。")) return;
  items = items.filter((item) => item.id !== id);
  render();
}

function addItem(event) {
  event.preventDefault();
  const item = {
    id: uuid(),
    name: $("itemNameInput").value.trim(),
    category: $("itemCategoryInput").value,
    price: Number($("itemPriceInput").value || 0),
    cost: Number($("itemCostInput").value || 0)
  };
  if (!item.name) return;
  items = [item, ...items];
  $("itemForm").reset();
  $("itemCostInput").value = 0;
  render();
}

function toggleColumnVisibility(id, checked) {
  if (!checked && columns.filter((column) => column.visible).length <= 1) {
    alert("至少要保留一個欄位顯示。");
    renderColumnSettings();
    return;
  }
  columns = columns.map((column) => column.id === id ? { ...column, visible: checked } : column);
  save();
  renderRecords();
}

function renameColumn(id, label) {
  columns = columns.map((column) => column.id === id ? { ...column, label: label.trim() || defaultColumns.find((base) => base.id === id)?.label || column.label } : column);
  save();
  renderRecords();
}

function moveColumn(id, direction) {
  const index = columns.findIndex((column) => column.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= columns.length) return;
  const nextColumns = [...columns];
  const [moved] = nextColumns.splice(index, 1);
  nextColumns.splice(nextIndex, 0, moved);
  columns = nextColumns;
  render();
}

function resetColumns() {
  if (!confirm("確定要恢復預設欄位嗎？")) return;
  columns = cloneDefaultColumns();
  render();
}

function exportCsv() {
  const displayColumns = visibleColumns();
  const header = displayColumns.map((column) => column.label);
  const rows = filteredRecords().map((record) => displayColumns.map((column) => recordCellText(record, column.id)));
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const period = selectedMonth() === "all" ? `${selectedYear()}全年` : `${selectedYear()}-${selectedMonth()}`;
  downloadBlob(`Soul_Nest_記帳_${period}.csv`, "text/csv;charset=utf-8", "\ufeff" + csv);
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function backupJson() {
  const data = {
    app: "Soul Nest 記帳系統",
    version: 3,
    exportedAt: new Date().toISOString(),
    records,
    items,
    columns
  };
  downloadBlob(`Soul_Nest_記帳備份_${todayISO()}.json`, "application/json", JSON.stringify(data, null, 2));
}

function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.records) || !Array.isArray(data.items)) throw new Error("格式不正確");
      if (!confirm("匯入後會覆蓋目前瀏覽器內的資料，確定要匯入嗎？")) return;
      records = data.records;
      items = data.items;
      columns = Array.isArray(data.columns) ? normalizeColumns(data.columns) : columns;
      render();
      alert("匯入完成");
    } catch (error) {
      alert("匯入失敗，請確認檔案是 Soul Nest 記帳備份 JSON。 ");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function downloadBlob(filename, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function resetDemoData() {
  if (!confirm("確定要重置成範例資料嗎？目前資料會被覆蓋。")) return;
  records = defaultRecords.map((record) => ({ ...record, id: uuid() }));
  items = defaultItems.map((item) => ({ ...item, id: uuid() }));
  columns = cloneDefaultColumns();
  render();
}

function init() {
  $("todayText").textContent = `今天：${todayISO()}`;
  renderCategoryOptions();
  renderDateFilters();
  $("yearFilter").value = currentYear();
  $("monthFilter").value = currentMonthNumber();
  openPage("dashboard");
  render();

  document.querySelectorAll(".nav-btn").forEach((button) => button.addEventListener("click", () => openPage(button.dataset.page)));
  $("newRecordTopBtn").addEventListener("click", () => openRecordDialog());
  $("closeDialogBtn").addEventListener("click", closeRecordDialog);
  $("recordForm").addEventListener("submit", submitRecord);
  $("deleteRecordBtn").addEventListener("click", deleteCurrentRecord);
  $("itemForm").addEventListener("submit", addItem);
  $("exportCsvBtn").addEventListener("click", exportCsv);
  $("backupJsonBtn").addEventListener("click", backupJson);
  $("importJsonInput").addEventListener("change", importJson);
  $("resetDemoBtn").addEventListener("click", resetDemoData);
  $("resetColumnsBtn").addEventListener("click", resetColumns);
  $("printBtn").addEventListener("click", () => window.print());
  $("yearFilter").addEventListener("change", render);
  $("monthFilter").addEventListener("change", render);
  $("searchInput").addEventListener("input", renderRecords);
  $("categoryFilter").addEventListener("change", renderRecords);
  $("statusFilter").addEventListener("change", renderRecords);
  ["priceInput", "qtyInput", "costInput", "categoryInput"].forEach((id) => $(id).addEventListener("input", updatePreview));
  $("itemInput").addEventListener("change", syncItemPreset);
  $("paymentStatusInput").addEventListener("change", () => {
    if ($("paymentStatusInput").value === "未收款") {
      $("paymentMethodInput").value = "尚未付款";
      $("paidDateInput").value = "";
    } else if (!$("paidDateInput").value) {
      $("paidDateInput").value = todayISO();
    }
  });
}

window.openRecordDialog = openRecordDialog;
window.deleteItem = deleteItem;
window.toggleColumnVisibility = toggleColumnVisibility;
window.renameColumn = renameColumn;
window.moveColumn = moveColumn;

// 讓瀏覽器載入完成後再初始化系統
document.addEventListener("DOMContentLoaded", init);
