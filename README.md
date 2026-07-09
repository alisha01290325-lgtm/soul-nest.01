<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Soul Nest 記帳系統</title>
  <link rel="icon" type="image/jpeg" href="assets/logo.jpg" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <img src="assets/logo.jpg" alt="Soul Nest Logo" class="brand-logo" />
        <div>
          <h1>Soul Nest</h1>
          <p>靈魂之巢｜記帳系統</p>
        </div>
      </div>
      <nav>
        <button class="nav-btn active" data-page="dashboard">儀表板</button>
        <button class="nav-btn" data-page="records">記帳明細</button>
        <button class="nav-btn" data-page="monthly">月報表</button>
        <button class="nav-btn" data-page="settings">系統設定</button>
      </nav>
      <div class="backup-box">
        <p>資料存在目前瀏覽器裡，換電腦前請先備份。</p>
        <button id="backupJsonBtn" class="soft-btn">備份 JSON</button>
        <label class="soft-btn file-btn">
          匯入備份
          <input id="importJsonInput" type="file" accept="application/json" hidden />
        </label>
      </div>
    </aside>

    <main>
      <header class="topbar">
        <div>
          <h2 id="pageTitle">儀表板</h2>
          <p id="todayText"></p>
        </div>
        <div class="top-actions">
          <select id="yearFilter" aria-label="選擇年份"></select>
          <select id="monthFilter" aria-label="選擇月份">
            <option value="all">全年</option>
          </select>
          <button id="newRecordTopBtn" class="primary-btn">＋新增記帳</button>
        </div>
      </header>

      <section id="dashboard" class="page active">
        <div class="dashboard-title">
          <div>
            <h3 id="periodTitle">本期儀表板</h3>
            <p class="muted">可以切換年份與月份，也可以看全部累計金額。</p>
          </div>
          <button id="exportCsvBtn" class="soft-btn">匯出目前期間 CSV</button>
        </div>

        <div class="cards dashboard-cards">
          <div class="card"><span id="periodRevenueLabel">本期總金額</span><strong id="sumRevenue">$0</strong></div>
          <div class="card"><span>本期給老師 / 成本</span><strong id="sumCost">$0</strong></div>
          <div class="card highlight"><span>本期我們淨收</span><strong id="sumProfit">$0</strong></div>
          <div class="card"><span>本期已收款</span><strong id="sumPaid">$0</strong></div>
          <div class="card"><span>本期未收款</span><strong id="sumUnpaid">$0</strong></div>
          <div class="card"><span>本期筆數</span><strong id="sumCount">0</strong></div>
          <div class="card total-card"><span>全部總金額</span><strong id="allRevenue">$0</strong></div>
          <div class="card total-card"><span>全部我們淨收</span><strong id="allProfit">$0</strong></div>
        </div>

        <div class="grid-two">
          <div class="panel">
            <div class="panel-head">
              <h3>分類收入 / 我們淨收</h3>
            </div>
            <div id="categorySummary" class="summary-list"></div>
          </div>
          <div class="panel">
            <h3>年度月份趨勢</h3>
            <div id="trendSummary" class="trend-list"></div>
          </div>
        </div>

        <div class="grid-two top-gap">
          <div class="panel">
            <h3>最近記帳</h3>
            <div class="table-wrap mini">
              <table>
                <thead>
                  <tr><th>日期</th><th>品項</th><th>客人</th><th>金額</th><th>狀態</th></tr>
                </thead>
                <tbody id="recentRows"></tbody>
              </table>
            </div>
          </div>
          <div class="panel">
            <h3>全部累計總覽</h3>
            <div id="allTimeSummary" class="summary-list compact"></div>
          </div>
        </div>
      </section>

      <section id="records" class="page">
        <div class="panel">
          <div class="panel-head wrap">
            <h3>記帳明細</h3>
            <div class="filters">
              <input id="searchInput" type="search" placeholder="搜尋品項 / 客人 / 備註" />
              <select id="categoryFilter"></select>
              <select id="statusFilter">
                <option value="all">全部狀態</option>
                <option value="已收款">已收款</option>
                <option value="未收款">未收款</option>
              </select>
              <select id="groupModeFilter" aria-label="選擇明細排序方式">
                <option value="category">依分類分組</option>
                <option value="date">依日期排序</option>
                <option value="customer">依客人 / 來源分組</option>
                <option value="paymentStatus">依付款狀態分組</option>
              </select>
              <button id="printBtn" class="soft-btn">列印</button>
            </div>
          </div>
          <p class="muted group-hint">預設會把同一分類放在一起，並顯示小計，資料變多也比較不亂。</p>
          <div class="table-wrap">
            <table class="records-table">
              <thead id="recordTableHead"></thead>
              <tbody id="recordRows"></tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="monthly" class="page">
        <div class="panel">
          <h3>年度月報表</h3>
          <p class="muted">依上方選擇的年份統計，月份選「全年」或單月都不影響這張年度表。</p>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>月份</th><th>收入</th><th>給老師 / 成本</th><th>我們淨收</th><th>已收款</th><th>未收款</th><th>筆數</th>
                </tr>
              </thead>
              <tbody id="monthlyRows"></tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="settings" class="page">
        <div class="panel settings-collapse-card">
          <div class="settings-collapse-head">
            <div>
              <h3>品項設定</h3>
              <p class="muted">可以點一下展開 / 收合，避免頁面太長。</p>
            </div>
            <button id="toggleItemsSettingsBtn" type="button" class="soft-btn settings-toggle-btn" aria-expanded="true">
              <span class="settings-toggle-text">收合</span>
              <span class="settings-toggle-icon">▾</span>
            </button>
          </div>
          <div id="itemsSettingsBody" class="settings-collapse-body">
            <div class="panel-head wrap inner-settings-head">
              <p class="muted">這裡可以設定每個服務「收客人多少、給老師多少、我們抽多少」。新增記帳選到品項時會自動帶入。</p>
              <button id="resetDemoBtn" class="danger-soft-btn">重置成範例資料</button>
            </div>
            <form id="itemForm" class="item-add-form">
              <input id="itemNameInput" placeholder="品項名稱，例如：感情儀式、塔羅四題" required />
              <select id="itemCategoryInput" required></select>
              <input id="itemPriceInput" type="number" min="0" placeholder="客人收費 / 件" required />
              <input id="itemCostInput" type="number" min="0" placeholder="給老師 / 件" value="0" required />
              <button class="primary-btn" type="submit">＋新增品項</button>
            </form>
            <p class="muted split-hint">例：感情儀式客人收 $3,000，給老師 $1,500，系統會自動算我們抽 $1,500。修改後會自動儲存。</p>
            <div id="itemList" class="item-settings-grid"></div>
          </div>
        </div>

        <div class="panel top-gap settings-collapse-card">
          <div class="settings-collapse-head">
            <div>
              <h3>選項設定</h3>
              <p class="muted">可自行新增 / 修改付款方式與負責人。</p>
            </div>
            <button id="toggleOptionsSettingsBtn" type="button" class="soft-btn settings-toggle-btn" aria-expanded="false">
              <span class="settings-toggle-text">展開</span>
              <span class="settings-toggle-icon">▸</span>
            </button>
          </div>
          <div id="optionsSettingsBody" class="settings-collapse-body hidden">
            <div class="options-grid">
              <div class="option-box">
                <h4>付款方式</h4>
                <form id="paymentMethodForm" class="option-add-form">
                  <input id="paymentMethodNameInput" placeholder="新增付款方式，例如：街口支付、全支付、信用卡" required />
                  <button class="primary-btn" type="submit">＋新增</button>
                </form>
                <div id="paymentMethodList" class="option-list"></div>
              </div>
              <div class="option-box">
                <h4>負責人</h4>
                <form id="ownerForm" class="option-add-form">
                  <input id="ownerNameInput" placeholder="新增負責人，例如：Alisha、席琳老師、合作老師" required />
                  <button class="primary-btn" type="submit">＋新增</button>
                </form>
                <div id="ownerList" class="option-list"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel top-gap settings-collapse-card">
          <div class="settings-collapse-head">
            <div>
              <h3>欄位設定</h3>
              <p class="muted">需要時再展開，不用一直往下拉很久。</p>
            </div>
            <button id="toggleColumnsSettingsBtn" type="button" class="soft-btn settings-toggle-btn" aria-expanded="false">
              <span class="settings-toggle-text">展開</span>
              <span class="settings-toggle-icon">▸</span>
            </button>
          </div>
          <div id="columnsSettingsBody" class="settings-collapse-body hidden">
            <div class="panel-head wrap inner-settings-head">
              <p class="muted">可控制「記帳明細」要顯示哪些欄位，也可以改欄位名稱與調整順序。匯出 CSV 會依照目前顯示欄位輸出。</p>
              <button id="resetColumnsBtn" class="soft-btn">恢復預設欄位</button>
            </div>
            <form id="customColumnForm" class="inline-form custom-column-form">
              <input id="customColumnNameInput" placeholder="新增自訂欄位，例如：老師名稱、老師分潤、IG帳號、平台來源" required />
              <button class="primary-btn" type="submit">＋新增欄位</button>
            </form>
            <div class="column-settings-head">
              <span>顯示</span>
              <span>欄位名稱</span>
              <span>順序 / 管理</span>
            </div>
            <div id="columnSettingsList" class="column-settings-list"></div>
          </div>
        </div>
      </section>
    </main>
  </div>

  <dialog id="recordDialog">
    <form id="recordForm" method="dialog" class="modal-card">
      <div class="modal-head">
        <h3 id="recordModalTitle">新增記帳</h3>
        <button type="button" id="closeDialogBtn" class="icon-btn">×</button>
      </div>
      <input id="recordId" type="hidden" />
      <div class="form-grid">
        <label>日期<input id="dateInput" type="date" required /></label>
        <label>分類<select id="categoryInput" required></select></label>
        <label class="wide">品項<input id="itemInput" list="itemOptions" placeholder="輸入或選擇品項" required /></label>
        <datalist id="itemOptions"></datalist>
        <label>客人 / 來源<input id="customerInput" placeholder="例如：客人暱稱、IG、LINE" /></label>
        <label>負責人<select id="ownerInput"></select></label>
        <label>付款狀態<select id="paymentStatusInput"><option>已收款</option><option>未收款</option></select></label>
        <label>付款方式<select id="paymentMethodInput"></select></label>
        <label>付款日期<input id="paidDateInput" type="date" /></label>
        <label>客人收費 / 件<input id="priceInput" type="number" min="0" step="1" required /></label>
        <label>數量<input id="qtyInput" type="number" min="1" step="1" value="1" required /></label>
        <label>給老師 / 成本總額<input id="costInput" type="number" min="0" step="1" value="0" /></label>
        <label class="wide">備註<textarea id="noteInput" rows="3" placeholder="例如：加急、老師分潤、客製儀式材料等"></textarea></label>
        <div id="customFieldInputs" class="custom-fields wide"></div>
      </div>
      <div class="modal-total">
        <span>總金額：<strong id="previewAmount">$0</strong></span>
        <span>預估我們淨收：<strong id="previewProfit">$0</strong></span>
      </div>
      <div class="modal-actions">
        <button type="button" id="deleteRecordBtn" class="danger-btn hidden">刪除</button>
        <button type="submit" class="primary-btn">儲存</button>
      </div>
    </form>
  </dialog>

  <script src="app.js"></script>
</body>
</html>
