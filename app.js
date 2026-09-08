const LEGACY_STORAGE_KEY = "groceries-tracker.transactions.v1";
const config = window.GROCERIES_TRACKER_CONFIG || {};
const isConfigured = Boolean(
  config.SUPABASE_URL &&
  config.SUPABASE_ANON_KEY &&
  !config.SUPABASE_URL.includes("YOUR_") &&
  !config.SUPABASE_ANON_KEY.includes("YOUR_")
);

const supabaseClient = isConfigured && window.supabase
  ? window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY)
  : null;

const state = {
  transactions: [],
  groceryLists: [],
  user: null,
  editingId: null,
  pendingDeleteId: null,
  expandedIds: new Set(),
  editingListId: null,
  pendingListDeleteId: null,
  shoppingListId: null,
  authMode: "signin",
  loading: false,
};

const el = {
  newTransactionBtn: document.querySelector("#newTransactionBtn"),
  emptyNewTransactionBtn: document.querySelector("#emptyNewTransactionBtn"),
  newListBtn: document.querySelector("#newListBtn"),
  sectionNewListBtn: document.querySelector("#sectionNewListBtn"),
  emptyNewListBtn: document.querySelector("#emptyNewListBtn"),
  mobileNewListBtn: document.querySelector("#mobileNewListBtn"),
  periodSelect: document.querySelector("#periodSelect"),
  specificMonthInput: document.querySelector("#specificMonthInput"),
  specificYearInput: document.querySelector("#specificYearInput"),
  selectedPeriodTotal: document.querySelector("#selectedPeriodTotal"),
  selectedPeriodLabel: document.querySelector("#selectedPeriodLabel"),
  monthTotal: document.querySelector("#monthTotal"),
  monthComparison: document.querySelector("#monthComparison"),
  yearTotal: document.querySelector("#yearTotal"),
  yearLabel: document.querySelector("#yearLabel"),
  transactionCount: document.querySelector("#transactionCount"),
  averageTransaction: document.querySelector("#averageTransaction"),
  transactionsList: document.querySelector("#transactionsList"),
  emptyState: document.querySelector("#emptyState"),
  searchInput: document.querySelector("#searchInput"),
  sortSelect: document.querySelector("#sortSelect"),
  transactionDialog: document.querySelector("#transactionDialog"),
  transactionForm: document.querySelector("#transactionForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
  transactionDate: document.querySelector("#transactionDate"),
  storeName: document.querySelector("#storeName"),
  dateError: document.querySelector("#dateError"),
  formGrandTotal: document.querySelector("#formGrandTotal"),
  itemsContainer: document.querySelector("#itemsContainer"),
  itemRowTemplate: document.querySelector("#itemRowTemplate"),
  addItemBtn: document.querySelector("#addItemBtn"),
  closeDialogBtn: document.querySelector("#closeDialogBtn"),
  cancelDialogBtn: document.querySelector("#cancelDialogBtn"),
  saveTransactionBtn: document.querySelector("#saveTransactionBtn"),
  formMessage: document.querySelector("#formMessage"),
  deleteDialog: document.querySelector("#deleteDialog"),
  cancelDeleteBtn: document.querySelector("#cancelDeleteBtn"),
  confirmDeleteBtn: document.querySelector("#confirmDeleteBtn"),
  authBtn: document.querySelector("#authBtn"),
  authBtnText: document.querySelector("#authBtnText"),
  authAvatar: document.querySelector("#authAvatar"),
  mobileNewTransactionBtn: document.querySelector("#mobileNewTransactionBtn"),
  syncStatus: document.querySelector("#syncStatus"),
  syncStatusText: document.querySelector("#syncStatusText"),
  authDialog: document.querySelector("#authDialog"),
  authForm: document.querySelector("#authForm"),
  authDialogTitle: document.querySelector("#authDialogTitle"),
  authCopy: document.querySelector("#authCopy"),
  authEmail: document.querySelector("#authEmail"),
  authPassword: document.querySelector("#authPassword"),
  authMessage: document.querySelector("#authMessage"),
  authSubmitBtn: document.querySelector("#authSubmitBtn"),
  authSwitchBtn: document.querySelector("#authSwitchBtn"),
  closeAuthDialogBtn: document.querySelector("#closeAuthDialogBtn"),
  accountDialog: document.querySelector("#accountDialog"),
  accountEmail: document.querySelector("#accountEmail"),
  closeAccountBtn: document.querySelector("#closeAccountBtn"),
  signOutBtn: document.querySelector("#signOutBtn"),
  historyCount: document.querySelector("#historyCount"),
  trendChart: document.querySelector("#trendChart"),
  trendSummary: document.querySelector("#trendSummary"),
  formItemCount: document.querySelector("#formItemCount"),
  footerGrandTotal: document.querySelector("#footerGrandTotal"),
  toastRegion: document.querySelector("#toastRegion"),
  groceryListsList: document.querySelector("#groceryListsList"),
  groceryListsEmptyState: document.querySelector("#groceryListsEmptyState"),
  groceryListCount: document.querySelector("#groceryListCount"),
  listSearchInput: document.querySelector("#listSearchInput"),
  listStatusFilter: document.querySelector("#listStatusFilter"),
  listDialog: document.querySelector("#listDialog"),
  listForm: document.querySelector("#listForm"),
  listDialogTitle: document.querySelector("#listDialogTitle"),
  listName: document.querySelector("#listName"),
  listPlannedDate: document.querySelector("#listPlannedDate"),
  listStoreName: document.querySelector("#listStoreName"),
  listBudget: document.querySelector("#listBudget"),
  addListItemBtn: document.querySelector("#addListItemBtn"),
  listItemsContainer: document.querySelector("#listItemsContainer"),
  listItemRowTemplate: document.querySelector("#listItemRowTemplate"),
  listFormMessage: document.querySelector("#listFormMessage"),
  listEstimatedTotal: document.querySelector("#listEstimatedTotal"),
  saveListBtn: document.querySelector("#saveListBtn"),
  closeListDialogBtn: document.querySelector("#closeListDialogBtn"),
  cancelListDialogBtn: document.querySelector("#cancelListDialogBtn"),
  shoppingDialog: document.querySelector("#shoppingDialog"),
  shoppingDialogTitle: document.querySelector("#shoppingDialogTitle"),
  shoppingStoreLabel: document.querySelector("#shoppingStoreLabel"),
  shoppingDate: document.querySelector("#shoppingDate"),
  shoppingProgress: document.querySelector("#shoppingProgress"),
  shoppingProgressBar: document.querySelector("#shoppingProgressBar"),
  shoppingCartTotal: document.querySelector("#shoppingCartTotal"),
  shoppingFooterTotal: document.querySelector("#shoppingFooterTotal"),
  shoppingBudgetStatus: document.querySelector("#shoppingBudgetStatus"),
  shoppingItemsContainer: document.querySelector("#shoppingItemsContainer"),
  shoppingFormMessage: document.querySelector("#shoppingFormMessage"),
  saveShoppingProgressBtn: document.querySelector("#saveShoppingProgressBtn"),
  finishShoppingBtn: document.querySelector("#finishShoppingBtn"),
  closeShoppingDialogBtn: document.querySelector("#closeShoppingDialogBtn"),
  deleteListDialog: document.querySelector("#deleteListDialog"),
  cancelDeleteListBtn: document.querySelector("#cancelDeleteListBtn"),
  confirmDeleteListBtn: document.querySelector("#confirmDeleteListBtn"),
};

const moneyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function formatMoney(value) {
  return moneyFormatter.format(Number(value) || 0).replace("PHP", "₱");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function localDateFromISO(iso) {
  return new Date(`${iso}T00:00:00`);
}

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function transactionTotal(transaction) {
  return transaction.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function setSyncStatus(text, type = "") {
  el.syncStatusText.textContent = text;
  el.syncStatus.classList.remove("online", "error", "loading");
  if (type) el.syncStatus.classList.add(type);

  const tooltip = type === "online"
    ? "All changes are saved to your cloud account."
    : type === "loading"
      ? "Your grocery data is syncing with Supabase."
      : type === "error"
        ? "Cloud sync needs attention."
        : "Sign in to sync your grocery records across devices.";
  el.syncStatus.title = tooltip;
  el.syncStatus.setAttribute("aria-label", `${text}. ${tooltip}`);
}

function showToast(message, type = "success") {
  if (!el.toastRegion) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.innerHTML = `<span class="toast-icon" aria-hidden="true">${type === "error" ? "!" : "✓"}</span><span>${message}</span>`;
  el.toastRegion.append(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 220);
  }, 3200);
}

function updateAccountUI() {
  const signedIn = Boolean(state.user);
  el.newTransactionBtn.disabled = !signedIn;
  el.emptyNewTransactionBtn.disabled = !signedIn;
  el.mobileNewTransactionBtn.disabled = !signedIn;
  [el.newListBtn, el.sectionNewListBtn, el.emptyNewListBtn, el.mobileNewListBtn]
    .filter(Boolean)
    .forEach((button) => { button.disabled = !signedIn; });
  el.authBtnText.textContent = signedIn ? "Account" : "Sign in";
  el.authAvatar.textContent = signedIn ? (state.user.email?.trim()?.[0] || "A").toUpperCase() : "?";
  el.authBtn.classList.toggle("signed-in", signedIn);
  el.authBtn.setAttribute("aria-label", signedIn ? `Open account for ${state.user.email || "signed-in user"}` : "Sign in");

  if (!isConfigured) {
    setSyncStatus("Database setup required", "error");
    return;
  }

  if (state.loading) setSyncStatus("Syncing…", "loading");
  else if (signedIn) setSyncStatus("Synced", "online");
  else setSyncStatus("Not signed in");
}

function getLastSixMonths() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const key = monthKey(date);
    const total = state.transactions
      .filter((transaction) => transaction.date.startsWith(key))
      .reduce((sum, transaction) => sum + transactionTotal(transaction), 0);
    return {
      key,
      total,
      shortLabel: date.toLocaleDateString("en-PH", { month: "short" }),
      longLabel: date.toLocaleDateString("en-PH", { month: "long", year: "numeric" }),
    };
  });
}

function renderSpendingTrend() {
  if (!el.trendChart) return;
  const months = getLastSixMonths();
  const maxTotal = Math.max(...months.map((month) => month.total), 0);
  const sixMonthTotal = months.reduce((sum, month) => sum + month.total, 0);
  const activeMonths = months.filter((month) => month.total > 0).length;

  el.trendChart.replaceChildren();
  months.forEach((month) => {
    const item = document.createElement("div");
    item.className = "trend-item";
    const normalized = maxTotal ? Math.max(8, (month.total / maxTotal) * 100) : 8;
    item.innerHTML = `
      <div class="trend-value">${month.total ? formatMoney(month.total) : "₱0"}</div>
      <div class="trend-track" title="${month.longLabel}: ${formatMoney(month.total)}">
        <div class="trend-bar${month.total ? " has-value" : ""}" style="height:${normalized}%"></div>
      </div>
      <span>${month.shortLabel}</span>`;
    el.trendChart.append(item);
  });

  if (!sixMonthTotal) {
    el.trendSummary.textContent = "Your monthly trend will appear after you save transactions.";
  } else {
    const average = sixMonthTotal / Math.max(activeMonths, 1);
    el.trendSummary.textContent = `${formatMoney(sixMonthTotal)} over 6 months · ${formatMoney(average)} avg. active month`;
  }
}

function getFilteredPeriodTransactions() {
  const now = new Date();
  const mode = el.periodSelect.value;

  if (mode === "all-time") return { items: state.transactions, label: "All time" };

  if (mode === "this-month") {
    const key = monthKey(now);
    return {
      items: state.transactions.filter((t) => t.date.startsWith(key)),
      label: new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric" }).format(now),
    };
  }

  if (mode === "last-month") {
    const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const key = monthKey(previous);
    return {
      items: state.transactions.filter((t) => t.date.startsWith(key)),
      label: new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric" }).format(previous),
    };
  }

  if (mode === "specific-month") {
    const key = el.specificMonthInput.value || monthKey(now);
    const [year, month] = key.split("-").map(Number);
    return {
      items: state.transactions.filter((t) => t.date.startsWith(key)),
      label: new Intl.DateTimeFormat("en-PH", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1)),
    };
  }

  if (mode === "this-year") {
    const year = String(now.getFullYear());
    return { items: state.transactions.filter((t) => t.date.startsWith(year)), label: year };
  }

  const year = String(el.specificYearInput.value || now.getFullYear());
  return { items: state.transactions.filter((t) => t.date.startsWith(year)), label: year };
}

function renderMetrics() {
  const now = new Date();
  const currentMonth = monthKey(now);
  const previousMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const currentYear = String(now.getFullYear());
  const period = getFilteredPeriodTransactions();

  const selectedTotal = period.items.reduce((sum, t) => sum + transactionTotal(t), 0);
  const monthlyTransactions = state.transactions.filter((t) => t.date.startsWith(currentMonth));
  const previousMonthlyTransactions = state.transactions.filter((t) => t.date.startsWith(previousMonth));
  const yearlyTransactions = state.transactions.filter((t) => t.date.startsWith(currentYear));
  const monthlyTotal = monthlyTransactions.reduce((sum, t) => sum + transactionTotal(t), 0);
  const previousMonthlyTotal = previousMonthlyTransactions.reduce((sum, t) => sum + transactionTotal(t), 0);
  const yearlyTotal = yearlyTransactions.reduce((sum, t) => sum + transactionTotal(t), 0);

  el.selectedPeriodTotal.textContent = formatMoney(selectedTotal);
  el.selectedPeriodLabel.textContent = period.label;
  el.monthTotal.textContent = formatMoney(monthlyTotal);
  el.yearTotal.textContent = formatMoney(yearlyTotal);
  el.yearLabel.textContent = `${yearlyTransactions.length} transaction${yearlyTransactions.length === 1 ? "" : "s"}`;
  el.transactionCount.textContent = String(period.items.length);
  el.averageTransaction.textContent = `${formatMoney(period.items.length ? selectedTotal / period.items.length : 0)} average`;

  el.monthComparison.classList.remove("trend-good", "trend-bad", "trend-neutral");
  if (!monthlyTotal && !previousMonthlyTotal) {
    el.monthComparison.textContent = "No spending yet";
    el.monthComparison.classList.add("trend-neutral");
  } else if (!previousMonthlyTotal) {
    el.monthComparison.textContent = "No previous-month baseline";
    el.monthComparison.classList.add("trend-neutral");
  } else {
    const percent = ((monthlyTotal - previousMonthlyTotal) / previousMonthlyTotal) * 100;
    if (Math.abs(percent) < 0.5) {
      el.monthComparison.textContent = "→ Same as previous month";
      el.monthComparison.classList.add("trend-neutral");
    } else if (percent < 0) {
      el.monthComparison.textContent = `↓ ${Math.abs(percent).toFixed(0)}% less than previous month`;
      el.monthComparison.classList.add("trend-good");
    } else {
      el.monthComparison.textContent = `↑ ${Math.abs(percent).toFixed(0)}% more than previous month`;
      el.monthComparison.classList.add("trend-bad");
    }
  }

  renderSpendingTrend();
}

function renderTransactions() {
  if (!isConfigured) {
    el.historyCount.textContent = "Database setup required";
    el.transactionsList.innerHTML = `<div class="setup-card"><strong>Connect Supabase to enable cloud sync.</strong>Edit <code>config.js</code> with your Supabase Project URL and anon/public key, then run <code>supabase.sql</code> in the Supabase SQL Editor.</div>`;
    el.emptyState.hidden = true;
    return;
  }

  if (!state.user) {
    el.historyCount.textContent = "Sign in to view records";
    el.transactionsList.innerHTML = `<div class="empty-state compact-empty"><div class="empty-icon" aria-hidden="true">☁</div><h3>Sign in to view your groceries</h3><p>Your transactions will sync across devices using the same account.</p></div>`;
    el.emptyState.hidden = true;
    return;
  }

  if (state.loading) {
    el.historyCount.textContent = "Loading transactions…";
    el.transactionsList.innerHTML = `
      <div class="skeleton-card"><span></span><div><b></b><i></i></div><strong></strong></div>
      <div class="skeleton-card"><span></span><div><b></b><i></i></div><strong></strong></div>
      <div class="skeleton-card"><span></span><div><b></b><i></i></div><strong></strong></div>`;
    el.emptyState.hidden = true;
    return;
  }

  const query = el.searchInput.value.trim().toLowerCase();
  const sortMode = el.sortSelect.value;
  let transactions = state.transactions.filter((transaction) => {
    if (!query) return true;
    const matchesStore = (transaction.storeName || "").toLowerCase().includes(query);
    const matchesItem = transaction.items.some((item) => item.name.toLowerCase().includes(query));
    return matchesStore || matchesItem;
  });

  transactions = [...transactions].sort((a, b) => {
    if (sortMode === "oldest") return a.date.localeCompare(b.date);
    if (sortMode === "highest") return transactionTotal(b) - transactionTotal(a);
    if (sortMode === "lowest") return transactionTotal(a) - transactionTotal(b);
    return b.date.localeCompare(a.date);
  });

  const countLabel = `${state.transactions.length} transaction${state.transactions.length === 1 ? "" : "s"}`;
  el.historyCount.textContent = query ? `${transactions.length} match${transactions.length === 1 ? "" : "es"} · ${countLabel}` : countLabel;

  el.transactionsList.replaceChildren();
  el.emptyState.hidden = transactions.length > 0 || (query && state.transactions.length > 0);

  if (!transactions.length && query && state.transactions.length) {
    const noResults = document.createElement("div");
    noResults.className = "empty-state";
    noResults.innerHTML = `<div class="empty-icon" aria-hidden="true">⌕</div><h3>No matching items</h3><p>Try another item or grocery store name.</p>`;
    el.transactionsList.append(noResults);
    return;
  }

  transactions.forEach((transaction) => {
    const total = transactionTotal(transaction);
    const date = localDateFromISO(transaction.date);
    const card = document.createElement("article");
    card.className = `transaction-card${state.expandedIds.has(transaction.id) ? " expanded" : ""}`;

    const summary = document.createElement("button");
    summary.className = "transaction-summary";
    summary.type = "button";
    summary.setAttribute("aria-expanded", String(state.expandedIds.has(transaction.id)));

    const badge = document.createElement("div");
    badge.className = "date-badge";
    badge.innerHTML = `<strong>${date.getDate()}</strong><span>${date.toLocaleDateString("en-PH", { month: "short" })}</span>`;

    const info = document.createElement("div");
    info.className = "transaction-info";
    const storeLabel = transaction.storeName ? transaction.storeName : "Store not specified";
    info.innerHTML = `<strong>${dateFormatter.format(date)}</strong><span class="transaction-store">${escapeHtml(storeLabel)}</span><span>${transaction.items.length} item${transaction.items.length === 1 ? "" : "s"}</span>`;

    const totalBox = document.createElement("div");
    totalBox.className = "transaction-total";
    totalBox.innerHTML = `<strong>${formatMoney(total)}</strong><span>Total expense</span>`;

    const chevron = document.createElement("span");
    chevron.className = "chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = "⌄";

    summary.append(badge, info, totalBox, chevron);
    summary.addEventListener("click", () => toggleTransaction(transaction.id));

    const details = document.createElement("div");
    details.className = "transaction-details";
    transaction.items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "transaction-item";
      const name = document.createElement("span");
      name.textContent = item.name;
      const price = document.createElement("span");
      price.className = "transaction-item-price";
      price.textContent = `${formatMoney(item.price)} × ${item.quantity}`;
      const subtotal = document.createElement("span");
      subtotal.className = "transaction-item-subtotal";
      subtotal.textContent = formatMoney(Number(item.price) * Number(item.quantity));
      row.append(name, price, subtotal);
      details.append(row);
    });

    const actions = document.createElement("div");
    actions.className = "transaction-actions";
    const duplicateBtn = document.createElement("button");
    duplicateBtn.className = "link-button";
    duplicateBtn.type = "button";
    duplicateBtn.textContent = "Duplicate";
    duplicateBtn.addEventListener("click", () => duplicateTransaction(transaction.id));
    const editBtn = document.createElement("button");
    editBtn.className = "link-button";
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openTransactionDialog(transaction.id));
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "link-button link-button-danger";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => openDeleteDialog(transaction.id));
    actions.append(duplicateBtn, editBtn, deleteBtn);
    details.append(actions);
    card.append(summary, details);
    el.transactionsList.append(card);
  });
}

function duplicateTransaction(id) {
  const transaction = state.transactions.find((item) => item.id === id);
  if (!transaction) return;
  resetForm();
  state.editingId = null;
  el.dialogTitle.textContent = "Duplicate transaction";
  el.saveTransactionBtn.textContent = "Save copy";
  el.transactionDate.value = todayISO();
  el.storeName.value = transaction.storeName || "";
  el.itemsContainer.replaceChildren();
  transaction.items.forEach((item) => addItemRow({ ...item }));
  if (!el.transactionDialog.open) el.transactionDialog.showModal();
  showToast("Transaction copied. Review the date and save when ready.", "success");
}

function toggleTransaction(id) {
  if (state.expandedIds.has(id)) state.expandedIds.delete(id);
  else state.expandedIds.add(id);
  renderTransactions();
}

function syncPeriodControls() {
  const mode = el.periodSelect.value;
  el.specificMonthInput.hidden = mode !== "specific-month";
  el.specificYearInput.hidden = mode !== "specific-year";
  renderMetrics();
}

function addItemRow(item = { name: "", price: "", quantity: 1 }) {
  const fragment = el.itemRowTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".item-row");
  const nameInput = row.querySelector(".item-name");
  const priceInput = row.querySelector(".item-price");
  const quantityInput = row.querySelector(".item-quantity");
  const removeBtn = row.querySelector(".remove-item-btn");

  nameInput.value = item.name ?? "";
  priceInput.value = item.price ?? "";
  quantityInput.value = item.quantity ?? 1;
  [priceInput, quantityInput].forEach((input) => input.addEventListener("input", updateFormTotals));
  nameInput.addEventListener("input", clearFormMessage);
  removeBtn.addEventListener("click", () => {
    if (el.itemsContainer.children.length === 1) {
      nameInput.value = "";
      priceInput.value = "";
      quantityInput.value = 1;
    } else row.remove();
    updateFormTotals();
  });

  el.itemsContainer.append(fragment);
  updateFormTotals();
}

function updateFormTotals() {
  let total = 0;
  el.itemsContainer.querySelectorAll(".item-row").forEach((row) => {
    const price = Number(row.querySelector(".item-price").value) || 0;
    const quantity = Number(row.querySelector(".item-quantity").value) || 0;
    const subtotal = price * quantity;
    row.querySelector(".item-subtotal").textContent = formatMoney(subtotal);
    total += subtotal;
  });
  const itemCount = [...el.itemsContainer.querySelectorAll(".item-row")]
    .filter((row) => row.querySelector(".item-name").value.trim() || row.querySelector(".item-price").value !== "").length;
  el.formGrandTotal.textContent = formatMoney(total);
  el.footerGrandTotal.textContent = formatMoney(total);
  el.formItemCount.textContent = `${Math.max(itemCount, 1)} item${Math.max(itemCount, 1) === 1 ? "" : "s"}`;
  clearFormMessage();
}

function clearFormMessage() {
  el.formMessage.textContent = "";
  el.dateError.textContent = "";
}

function resetForm() {
  el.transactionForm.reset();
  el.itemsContainer.replaceChildren();
  el.transactionDate.value = todayISO();
  el.storeName.value = "";
  addItemRow();
  state.editingId = null;
  clearFormMessage();
}

function openTransactionDialog(id = null) {
  if (!state.user) return openAuthDialog();
  resetForm();
  state.editingId = id;

  if (id) {
    const transaction = state.transactions.find((t) => t.id === id);
    if (!transaction) return;
    el.dialogTitle.textContent = "Edit transaction";
    el.saveTransactionBtn.textContent = "Update transaction";
    el.transactionDate.value = transaction.date;
    el.storeName.value = transaction.storeName || "";
    el.itemsContainer.replaceChildren();
    transaction.items.forEach((item) => addItemRow(item));
  } else {
    el.dialogTitle.textContent = "New transaction";
    el.saveTransactionBtn.textContent = "Save transaction";
  }

  if (!el.transactionDialog.open) el.transactionDialog.showModal();
  setTimeout(() => el.itemsContainer.querySelector(".item-name")?.focus(), 0);
}

function closeTransactionDialog() {
  if (el.transactionDialog.open) el.transactionDialog.close();
}

function collectAndValidateTransaction() {
  clearFormMessage();
  const date = el.transactionDate.value;
  const storeName = el.storeName.value.trim();
  if (!date) {
    el.dateError.textContent = "Choose a transaction date.";
    return null;
  }

  const rows = [...el.itemsContainer.querySelectorAll(".item-row")];
  const items = [];
  for (const row of rows) {
    const name = row.querySelector(".item-name").value.trim();
    const priceRaw = row.querySelector(".item-price").value;
    const quantityRaw = row.querySelector(".item-quantity").value;
    const price = Number(priceRaw);
    const quantity = Number(quantityRaw);
    const fullyBlank = !name && priceRaw === "";
    if (fullyBlank && rows.length > 1) continue;

    if (!name) {
      el.formMessage.textContent = "Please enter a name for every grocery item.";
      row.querySelector(".item-name").focus();
      return null;
    }
    if (priceRaw === "" || !Number.isFinite(price) || price < 0) {
      el.formMessage.textContent = "Each item needs a valid price of ₱0.00 or higher.";
      row.querySelector(".item-price").focus();
      return null;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      el.formMessage.textContent = "Quantity must be a whole number of 1 or more.";
      row.querySelector(".item-quantity").focus();
      return null;
    }
    items.push({ name, price: Number(price.toFixed(2)), quantity });
  }

  if (!items.length) {
    el.formMessage.textContent = "Add at least one grocery item.";
    return null;
  }
  return { date, storeName, items };
}

async function handleTransactionSubmit(event) {
  event.preventDefault();
  if (!state.user || !supabaseClient) return;
  const data = collectAndValidateTransaction();
  if (!data) return;

  el.saveTransactionBtn.disabled = true;
  el.saveTransactionBtn.textContent = state.editingId ? "Updating…" : "Saving…";

  try {
    if (state.editingId) {
      const { error } = await supabaseClient
        .from("grocery_transactions")
        .update({ transaction_date: data.date, store_name: data.storeName || null, items: data.items, updated_at: new Date().toISOString() })
        .eq("id", state.editingId);
      if (error) throw error;
    } else {
      const { error } = await supabaseClient.from("grocery_transactions").insert({
        user_id: state.user.id,
        transaction_date: data.date,
        store_name: data.storeName || null,
        items: data.items,
      });
      if (error) throw error;
    }
    const wasEditing = Boolean(state.editingId);
    closeTransactionDialog();
    await loadCloudTransactions();
    showToast(wasEditing ? "Transaction updated and synced." : "Transaction saved and synced.");
  } catch (error) {
    el.formMessage.textContent = error.message || "Could not save the transaction.";
    showToast(el.formMessage.textContent, "error");
  } finally {
    el.saveTransactionBtn.disabled = false;
    el.saveTransactionBtn.textContent = state.editingId ? "Update transaction" : "Save transaction";
  }
}

function openDeleteDialog(id) {
  state.pendingDeleteId = id;
  if (!el.deleteDialog.open) el.deleteDialog.showModal();
}

async function deletePendingTransaction() {
  if (!state.pendingDeleteId || !state.user || !supabaseClient) return;
  el.confirmDeleteBtn.disabled = true;
  el.confirmDeleteBtn.textContent = "Deleting…";
  try {
    const id = state.pendingDeleteId;
    const { error } = await supabaseClient.from("grocery_transactions").delete().eq("id", id);
    if (error) throw error;
    state.expandedIds.delete(id);
    state.pendingDeleteId = null;
    el.deleteDialog.close();
    await loadCloudTransactions();
    showToast("Transaction deleted.");
  } catch (error) {
    showToast(error.message || "Could not delete this transaction.", "error");
  } finally {
    el.confirmDeleteBtn.disabled = false;
    el.confirmDeleteBtn.textContent = "Delete";
  }
}

async function loadCloudTransactions() {
  if (!state.user || !supabaseClient) {
    state.transactions = [];
    renderAll();
    return;
  }

  state.loading = true;
  updateAccountUI();
  renderTransactions();
  try {
    const { data, error } = await supabaseClient
      .from("grocery_transactions")
      .select("id, transaction_date, store_name, items, created_at, updated_at")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    state.transactions = (data || []).map((row) => ({
      id: row.id,
      date: row.transaction_date,
      storeName: row.store_name || "",
      items: Array.isArray(row.items) ? row.items : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    console.error(error);
    setSyncStatus("Sync error", "error");
    showToast("Could not sync your transactions. Check your connection and Supabase setup.", "error");
    state.transactions = [];
  } finally {
    state.loading = false;
    updateAccountUI();
    renderAll();
  }
}

function setAuthMode(mode) {
  state.authMode = mode;
  const signingUp = mode === "signup";
  el.authDialogTitle.textContent = signingUp ? "Create account" : "Sign in";
  el.authCopy.textContent = signingUp
    ? "Create an account so your grocery data can sync securely across your devices."
    : "Sign in to access the same grocery data on your phone, laptop, and other devices.";
  el.authSubmitBtn.textContent = signingUp ? "Create account" : "Sign in";
  el.authSwitchBtn.textContent = signingUp ? "Already have an account? Sign in" : "Create an account instead";
  el.authPassword.autocomplete = signingUp ? "new-password" : "current-password";
  el.authMessage.textContent = "";
}

function openAuthDialog() {
  if (!isConfigured) {
    alert("Connect Supabase first by filling in config.js and running supabase.sql.");
    return;
  }
  setAuthMode("signin");
  el.authForm.reset();
  if (!el.authDialog.open) el.authDialog.showModal();
  setTimeout(() => el.authEmail.focus(), 0);
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  if (!supabaseClient) return;
  const email = el.authEmail.value.trim();
  const password = el.authPassword.value;
  if (!email || password.length < 6) {
    el.authMessage.textContent = "Enter a valid email and a password of at least 6 characters.";
    return;
  }

  el.authSubmitBtn.disabled = true;
  el.authSubmitBtn.textContent = state.authMode === "signup" ? "Creating…" : "Signing in…";
  el.authMessage.textContent = "";
  try {
    if (state.authMode === "signup") {
      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.session) {
        el.authMessage.textContent = "Account created. Check your email to confirm it, then sign in.";
        setAuthMode("signin");
        el.authEmail.value = email;
        return;
      }
    } else {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }
    el.authDialog.close();
    showToast(state.authMode === "signup" ? "Account created and signed in." : "Signed in successfully.");
  } catch (error) {
    el.authMessage.textContent = error.message || "Authentication failed.";
    showToast(el.authMessage.textContent, "error");
  } finally {
    el.authSubmitBtn.disabled = false;
    el.authSubmitBtn.textContent = state.authMode === "signup" ? "Create account" : "Sign in";
  }
}

function openAccountDialog() {
  if (!state.user) return openAuthDialog();
  el.accountEmail.textContent = state.user.email || "Signed in";
  if (!el.accountDialog.open) el.accountDialog.showModal();
}

async function signOut() {
  if (!supabaseClient) return;
  el.signOutBtn.disabled = true;
  try {
    await supabaseClient.auth.signOut();
    el.accountDialog.close();
    showToast("Signed out successfully.");
  } finally {
    el.signOutBtn.disabled = false;
  }
}


function makeItemId() {
  return globalThis.crypto?.randomUUID?.() || `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeListItem(item = {}) {
  const estimatedPrice = item.estimatedPrice === null || item.estimatedPrice === undefined || item.estimatedPrice === ""
    ? null
    : Number(item.estimatedPrice);
  const actualPrice = item.actualPrice === null || item.actualPrice === undefined || item.actualPrice === ""
    ? null
    : Number(item.actualPrice);
  return {
    id: item.id || makeItemId(),
    name: String(item.name || ""),
    quantity: Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0 ? Number(item.quantity) : 1,
    estimatedPrice: Number.isFinite(estimatedPrice) ? Number(estimatedPrice.toFixed(2)) : null,
    actualPrice: Number.isFinite(actualPrice) ? Number(actualPrice.toFixed(2)) : null,
    purchased: Boolean(item.purchased),
    notes: String(item.notes || ""),
  };
}

function listEstimatedTotal(list) {
  return (list.items || []).reduce((sum, item) => {
    const price = Number(item.estimatedPrice);
    return sum + (Number.isFinite(price) ? price : 0) * (Number(item.quantity) || 0);
  }, 0);
}

function listActualTotal(list) {
  return (list.items || []).reduce((sum, item) => {
    if (!item.purchased) return sum;
    const price = Number(item.actualPrice);
    return sum + (Number.isFinite(price) ? price : 0) * (Number(item.quantity) || 0);
  }, 0);
}

function listProgress(list) {
  const total = (list.items || []).length;
  const purchased = (list.items || []).filter((item) => item.purchased).length;
  return { purchased, total, percent: total ? Math.round((purchased / total) * 100) : 0 };
}

function statusLabel(status) {
  if (status === "shopping") return "Shopping";
  if (status === "completed") return "Completed";
  return "Planned";
}

function renderGroceryLists() {
  if (!el.groceryListsList) return;

  if (!isConfigured) {
    el.groceryListCount.textContent = "Database setup required";
    el.groceryListsList.innerHTML = `<div class="setup-card"><strong>Run the updated <code>supabase.sql</code>.</strong>The grocery-list feature needs the new <code>grocery_lists</code> table and its Row Level Security policies.</div>`;
    el.groceryListsEmptyState.hidden = true;
    return;
  }

  if (!state.user) {
    el.groceryListCount.textContent = "Sign in to use grocery lists";
    el.groceryListsList.innerHTML = `<div class="empty-state compact-empty"><div class="empty-icon" aria-hidden="true">📝</div><h3>Your shopping plans sync too</h3><p>Sign in to create grocery lists that stay available on your phone and laptop.</p></div>`;
    el.groceryListsEmptyState.hidden = true;
    return;
  }

  if (state.loading) {
    el.groceryListCount.textContent = "Loading grocery lists…";
    el.groceryListsList.innerHTML = `
      <div class="list-skeleton"></div>
      <div class="list-skeleton"></div>`;
    el.groceryListsEmptyState.hidden = true;
    return;
  }

  const query = (el.listSearchInput?.value || "").trim().toLowerCase();
  const filter = el.listStatusFilter?.value || "active";

  let lists = state.groceryLists.filter((list) => {
    if (filter === "active" && list.status === "completed") return false;
    if (filter !== "active" && filter !== "all" && list.status !== filter) return false;
    if (!query) return true;
    return (list.name || "").toLowerCase().includes(query)
      || (list.storeName || "").toLowerCase().includes(query)
      || (list.items || []).some((item) => `${item.name} ${item.notes || ""}`.toLowerCase().includes(query));
  });

  lists = [...lists].sort((a, b) => {
    const statusRank = { shopping: 0, planned: 1, completed: 2 };
    const rankDiff = (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9);
    if (rankDiff) return rankDiff;
    const aDate = a.plannedDate || a.createdAt?.slice(0, 10) || "";
    const bDate = b.plannedDate || b.createdAt?.slice(0, 10) || "";
    return aDate.localeCompare(bDate);
  });

  const activeCount = state.groceryLists.filter((list) => list.status !== "completed").length;
  el.groceryListCount.textContent = `${activeCount} active list${activeCount === 1 ? "" : "s"} · ${state.groceryLists.length} total`;
  el.groceryListsList.replaceChildren();

  const noResults = !lists.length && state.groceryLists.length > 0;
  el.groceryListsEmptyState.hidden = lists.length > 0 || noResults || state.groceryLists.length > 0;

  if (!state.groceryLists.length) {
    el.groceryListsEmptyState.hidden = false;
    return;
  }

  if (noResults) {
    const empty = document.createElement("div");
    empty.className = "empty-state compact-empty";
    empty.innerHTML = `<div class="empty-icon" aria-hidden="true">⌕</div><h3>No matching grocery lists</h3><p>Try another search term or status filter.</p>`;
    el.groceryListsList.append(empty);
    return;
  }

  lists.forEach((list) => {
    const progress = listProgress(list);
    const estimated = listEstimatedTotal(list);
    const actual = listActualTotal(list);
    const card = document.createElement("article");
    card.className = `grocery-list-card status-${list.status}`;

    const dateText = list.plannedDate
      ? dateFormatter.format(localDateFromISO(list.plannedDate))
      : "No planned date";
    const storeText = list.storeName || "Store not set";
    const hasBudget = list.budget !== null && list.budget !== undefined && list.budget !== "";
    const budget = hasBudget ? Number(list.budget) : null;

    card.innerHTML = `
      <div class="grocery-list-card-main">
        <div class="list-card-topline">
          <span class="status-pill status-${list.status}">${statusLabel(list.status)}</span>
          <span class="list-date">${escapeHtml(dateText)}</span>
        </div>
        <h3>${escapeHtml(list.name || "Grocery list")}</h3>
        <p class="list-store">${escapeHtml(storeText)}</p>
        <div class="list-progress-row">
          <div class="progress-track"><span style="width:${progress.percent}%"></span></div>
          <strong>${progress.purchased}/${progress.total}</strong>
        </div>
        <div class="list-card-metrics">
          <div><span>Estimated</span><strong>${formatMoney(estimated)}</strong></div>
          <div><span>${list.status === "completed" ? "Spent" : "Current cart"}</span><strong>${formatMoney(actual)}</strong></div>
          <div><span>Budget</span><strong>${hasBudget && Number.isFinite(budget) ? formatMoney(budget) : "—"}</strong></div>
        </div>
      </div>
      <div class="grocery-list-card-actions"></div>`;

    const actions = card.querySelector(".grocery-list-card-actions");

    if (list.status !== "completed") {
      const shopBtn = document.createElement("button");
      shopBtn.className = "button button-primary button-small";
      shopBtn.type = "button";
      shopBtn.textContent = list.status === "shopping" ? "Continue shopping" : "Start shopping";
      shopBtn.addEventListener("click", () => openShoppingMode(list.id));
      actions.append(shopBtn);

      const editBtn = document.createElement("button");
      editBtn.className = "button button-ghost button-small";
      editBtn.type = "button";
      editBtn.textContent = "Edit plan";
      editBtn.addEventListener("click", () => openListDialog(list.id));
      actions.append(editBtn);
    }

    const duplicateBtn = document.createElement("button");
    duplicateBtn.className = "link-button";
    duplicateBtn.type = "button";
    duplicateBtn.textContent = "Duplicate";
    duplicateBtn.addEventListener("click", () => duplicateGroceryList(list.id));
    actions.append(duplicateBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "link-button link-button-danger";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => openDeleteListDialog(list.id));
    actions.append(deleteBtn);

    el.groceryListsList.append(card);
  });
}

function addListItemRow(item = {}) {
  const normalized = normalizeListItem(item);
  const fragment = el.listItemRowTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".list-item-row");
  row.dataset.itemId = normalized.id;

  const nameInput = row.querySelector(".list-item-name");
  const priceInput = row.querySelector(".list-item-estimated-price");
  const quantityInput = row.querySelector(".list-item-quantity");
  const notesInput = row.querySelector(".list-item-notes");
  const removeBtn = row.querySelector(".remove-list-item-btn");

  nameInput.value = normalized.name;
  priceInput.value = normalized.estimatedPrice ?? "";
  quantityInput.value = normalized.quantity;
  notesInput.value = normalized.notes;

  [priceInput, quantityInput].forEach((input) => input.addEventListener("input", updateListEstimatedTotal));
  [nameInput, notesInput].forEach((input) => input.addEventListener("input", () => { el.listFormMessage.textContent = ""; }));
  removeBtn.addEventListener("click", () => {
    if (el.listItemsContainer.children.length === 1) {
      nameInput.value = "";
      priceInput.value = "";
      quantityInput.value = 1;
      notesInput.value = "";
    } else {
      row.remove();
    }
    updateListEstimatedTotal();
  });

  el.listItemsContainer.append(fragment);
  updateListEstimatedTotal();
}

function updateListEstimatedTotal() {
  let total = 0;
  el.listItemsContainer.querySelectorAll(".list-item-row").forEach((row) => {
    const price = Number(row.querySelector(".list-item-estimated-price").value);
    const quantity = Number(row.querySelector(".list-item-quantity").value) || 0;
    if (Number.isFinite(price) && price >= 0) total += price * quantity;
  });
  el.listEstimatedTotal.textContent = formatMoney(total);
  el.listFormMessage.textContent = "";
}

function resetListForm() {
  el.listForm.reset();
  el.listItemsContainer.replaceChildren();
  el.listName.value = "Grocery list";
  el.listPlannedDate.value = todayISO();
  el.listStoreName.value = "";
  el.listBudget.value = "";
  state.editingListId = null;
  addListItemRow();
  el.listFormMessage.textContent = "";
}

function openListDialog(id = null) {
  if (!state.user) return openAuthDialog();
  resetListForm();
  state.editingListId = id;

  if (id) {
    const list = state.groceryLists.find((entry) => entry.id === id);
    if (!list) return;
    el.listDialogTitle.textContent = "Edit grocery list";
    el.saveListBtn.textContent = "Update list";
    el.listName.value = list.name || "Grocery list";
    el.listPlannedDate.value = list.plannedDate || "";
    el.listStoreName.value = list.storeName || "";
    el.listBudget.value = list.budget ?? "";
    el.listItemsContainer.replaceChildren();
    list.items.forEach((item) => addListItemRow(item));
  } else {
    el.listDialogTitle.textContent = "New grocery list";
    el.saveListBtn.textContent = "Save grocery list";
  }

  if (!el.listDialog.open) el.listDialog.showModal();
  setTimeout(() => el.listName.focus(), 0);
}

function closeListDialog() {
  if (el.listDialog.open) el.listDialog.close();
}

function collectListForm() {
  const name = el.listName.value.trim();
  const plannedDate = el.listPlannedDate.value || null;
  const storeName = el.listStoreName.value.trim();
  const budgetRaw = el.listBudget.value;
  const budget = budgetRaw === "" ? null : Number(budgetRaw);

  if (!name) {
    el.listFormMessage.textContent = "Give this grocery list a name.";
    el.listName.focus();
    return null;
  }
  if (budgetRaw !== "" && (!Number.isFinite(budget) || budget < 0)) {
    el.listFormMessage.textContent = "Budget must be ₱0.00 or higher.";
    el.listBudget.focus();
    return null;
  }

  const existingList = state.groceryLists.find((entry) => entry.id === state.editingListId);
  const oldItemsById = new Map((existingList?.items || []).map((item) => [item.id, item]));
  const items = [];

  for (const row of el.listItemsContainer.querySelectorAll(".list-item-row")) {
    const itemId = row.dataset.itemId || makeItemId();
    const itemName = row.querySelector(".list-item-name").value.trim();
    const priceRaw = row.querySelector(".list-item-estimated-price").value;
    const quantity = Number(row.querySelector(".list-item-quantity").value);
    const notes = row.querySelector(".list-item-notes").value.trim();
    const fullyBlank = !itemName && priceRaw === "" && !notes;

    if (fullyBlank && el.listItemsContainer.children.length > 1) continue;
    if (!itemName) {
      el.listFormMessage.textContent = "Enter a name for every list item.";
      row.querySelector(".list-item-name").focus();
      return null;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      el.listFormMessage.textContent = "Each item quantity must be a whole number of 1 or more.";
      row.querySelector(".list-item-quantity").focus();
      return null;
    }

    let estimatedPrice = null;
    if (priceRaw !== "") {
      estimatedPrice = Number(priceRaw);
      if (!Number.isFinite(estimatedPrice) || estimatedPrice < 0) {
        el.listFormMessage.textContent = "Estimated prices must be ₱0.00 or higher.";
        row.querySelector(".list-item-estimated-price").focus();
        return null;
      }
      estimatedPrice = Number(estimatedPrice.toFixed(2));
    }

    const previous = oldItemsById.get(itemId);
    items.push({
      id: itemId,
      name: itemName,
      quantity,
      estimatedPrice,
      actualPrice: previous?.actualPrice ?? null,
      purchased: previous?.purchased ?? false,
      notes,
    });
  }

  if (!items.length) {
    el.listFormMessage.textContent = "Add at least one grocery item.";
    return null;
  }

  return {
    name,
    plannedDate,
    storeName,
    budget: budget === null ? null : Number(budget.toFixed(2)),
    items,
  };
}

async function handleListSubmit(event) {
  event.preventDefault();
  if (!state.user || !supabaseClient) return;
  const data = collectListForm();
  if (!data) return;

  el.saveListBtn.disabled = true;
  el.saveListBtn.textContent = state.editingListId ? "Updating…" : "Saving…";

  try {
    if (state.editingListId) {
      const { error } = await supabaseClient
        .from("grocery_lists")
        .update({
          list_name: data.name,
          planned_date: data.plannedDate,
          store_name: data.storeName || null,
          budget: data.budget,
          items: data.items,
          updated_at: new Date().toISOString(),
        })
        .eq("id", state.editingListId);
      if (error) throw error;
    } else {
      const { error } = await supabaseClient.from("grocery_lists").insert({
        user_id: state.user.id,
        list_name: data.name,
        planned_date: data.plannedDate,
        store_name: data.storeName || null,
        budget: data.budget,
        status: "planned",
        items: data.items,
      });
      if (error) throw error;
    }

    const wasEditing = Boolean(state.editingListId);
    closeListDialog();
    await loadGroceryLists();
    showToast(wasEditing ? "Grocery list updated and synced." : "Grocery list saved and synced.");
  } catch (error) {
    el.listFormMessage.textContent = error.message || "Could not save this grocery list.";
    showToast(el.listFormMessage.textContent, "error");
  } finally {
    el.saveListBtn.disabled = false;
    el.saveListBtn.textContent = state.editingListId ? "Update list" : "Save grocery list";
  }
}

async function duplicateGroceryList(id) {
  const list = state.groceryLists.find((entry) => entry.id === id);
  if (!list || !state.user || !supabaseClient) return;
  try {
    const items = list.items.map((item) => ({
      ...normalizeListItem(item),
      id: makeItemId(),
      purchased: false,
      actualPrice: null,
    }));
    const { error } = await supabaseClient.from("grocery_lists").insert({
      user_id: state.user.id,
      list_name: `${list.name || "Grocery list"} copy`,
      planned_date: todayISO(),
      shopping_date: null,
      store_name: list.storeName || null,
      budget: list.budget,
      status: "planned",
      items,
    });
    if (error) throw error;
    await loadGroceryLists();
    showToast("Grocery list duplicated.");
  } catch (error) {
    showToast(error.message || "Could not duplicate this list.", "error");
  }
}

function openDeleteListDialog(id) {
  state.pendingListDeleteId = id;
  if (!el.deleteListDialog.open) el.deleteListDialog.showModal();
}

async function deletePendingList() {
  if (!state.pendingListDeleteId || !state.user || !supabaseClient) return;
  el.confirmDeleteListBtn.disabled = true;
  el.confirmDeleteListBtn.textContent = "Deleting…";
  try {
    const { error } = await supabaseClient.from("grocery_lists").delete().eq("id", state.pendingListDeleteId);
    if (error) throw error;
    state.pendingListDeleteId = null;
    el.deleteListDialog.close();
    await loadGroceryLists();
    showToast("Grocery list deleted.");
  } catch (error) {
    showToast(error.message || "Could not delete this grocery list.", "error");
  } finally {
    el.confirmDeleteListBtn.disabled = false;
    el.confirmDeleteListBtn.textContent = "Delete list";
  }
}

function buildShoppingItems(list) {
  el.shoppingItemsContainer.replaceChildren();
  list.items.forEach((rawItem) => {
    const item = normalizeListItem(rawItem);
    const card = document.createElement("article");
    card.className = `shopping-item${item.purchased ? " purchased" : ""}`;
    card.dataset.itemId = item.id;

    const estimatedCopy = item.estimatedPrice === null
      ? "No estimate"
      : `${formatMoney(item.estimatedPrice)} est. / unit`;

    card.innerHTML = `
      <label class="shopping-check">
        <input class="shopping-purchased" type="checkbox" ${item.purchased ? "checked" : ""} />
        <span aria-hidden="true">✓</span>
      </label>
      <div class="shopping-item-copy">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.notes || estimatedCopy)}</span>
        ${item.notes ? `<small>${escapeHtml(estimatedCopy)}</small>` : ""}
      </div>
      <label class="shopping-input">
        <span>Qty</span>
        <input class="shopping-quantity" type="number" min="1" step="1" inputmode="numeric" value="${item.quantity}" />
      </label>
      <label class="shopping-input actual-price-field">
        <span>Actual price / unit</span>
        <div class="money-field">
          <span>₱</span>
          <input class="shopping-actual-price" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0.00" value="${item.actualPrice ?? ""}" />
        </div>
      </label>
      <div class="shopping-line-total">
        <span>Subtotal</span>
        <strong>₱0.00</strong>
      </div>`;

    const checkbox = card.querySelector(".shopping-purchased");
    checkbox.addEventListener("change", () => {
      card.classList.toggle("purchased", checkbox.checked);
      updateShoppingSummary();
    });
    card.querySelector(".shopping-quantity").addEventListener("input", updateShoppingSummary);
    card.querySelector(".shopping-actual-price").addEventListener("input", updateShoppingSummary);
    el.shoppingItemsContainer.append(card);
  });
  updateShoppingSummary();
}

function collectShoppingState({ requirePrices = false } = {}) {
  const items = [];
  let firstProblem = null;
  for (const card of el.shoppingItemsContainer.querySelectorAll(".shopping-item")) {
    const originalList = state.groceryLists.find((entry) => entry.id === state.shoppingListId);
    const original = originalList?.items.find((item) => item.id === card.dataset.itemId) || {};
    const quantity = Number(card.querySelector(".shopping-quantity").value);
    const actualRaw = card.querySelector(".shopping-actual-price").value;
    const purchased = card.querySelector(".shopping-purchased").checked;

    if (!Number.isInteger(quantity) || quantity < 1) {
      firstProblem = firstProblem || { message: "Quantity must be a whole number of 1 or more.", input: card.querySelector(".shopping-quantity") };
    }

    let actualPrice = null;
    if (actualRaw !== "") {
      actualPrice = Number(actualRaw);
      if (!Number.isFinite(actualPrice) || actualPrice < 0) {
        firstProblem = firstProblem || { message: "Actual prices must be ₱0.00 or higher.", input: card.querySelector(".shopping-actual-price") };
      } else {
        actualPrice = Number(actualPrice.toFixed(2));
      }
    }

    if (requirePrices && purchased && actualRaw === "") {
      firstProblem = firstProblem || { message: "Enter the actual price for every item in your cart before finishing.", input: card.querySelector(".shopping-actual-price") };
    }

    items.push({
      ...normalizeListItem(original),
      id: card.dataset.itemId,
      quantity: Number.isInteger(quantity) && quantity > 0 ? quantity : 1,
      actualPrice,
      purchased,
    });
  }

  if (firstProblem) {
    el.shoppingFormMessage.textContent = firstProblem.message;
    firstProblem.input.focus();
    return null;
  }

  if (requirePrices && !items.some((item) => item.purchased)) {
    el.shoppingFormMessage.textContent = "Check at least one item that you purchased.";
    return null;
  }

  return items;
}

function updateShoppingSummary() {
  if (!state.shoppingListId) return;
  const list = state.groceryLists.find((entry) => entry.id === state.shoppingListId);
  if (!list) return;

  let purchased = 0;
  let total = 0;
  let cart = 0;

  el.shoppingItemsContainer.querySelectorAll(".shopping-item").forEach((card) => {
    total += 1;
    const isPurchased = card.querySelector(".shopping-purchased").checked;
    const quantity = Number(card.querySelector(".shopping-quantity").value) || 0;
    const actual = Number(card.querySelector(".shopping-actual-price").value);
    const subtotal = isPurchased && Number.isFinite(actual) ? actual * quantity : 0;
    if (isPurchased) purchased += 1;
    cart += subtotal;
    card.querySelector(".shopping-line-total strong").textContent = formatMoney(subtotal);
  });

  const percent = total ? Math.round((purchased / total) * 100) : 0;
  el.shoppingProgress.textContent = `${purchased} / ${total}`;
  el.shoppingProgressBar.style.width = `${percent}%`;
  el.shoppingCartTotal.textContent = formatMoney(cart);
  el.shoppingFooterTotal.textContent = formatMoney(cart);

  const hasBudget = list.budget !== null && list.budget !== undefined && list.budget !== "";
  const budget = hasBudget ? Number(list.budget) : null;
  if (!hasBudget || !Number.isFinite(budget)) {
    el.shoppingBudgetStatus.textContent = "No budget set";
    el.shoppingBudgetStatus.className = "";
  } else {
    const remaining = budget - cart;
    el.shoppingBudgetStatus.textContent = remaining >= 0
      ? `${formatMoney(remaining)} remaining`
      : `${formatMoney(Math.abs(remaining))} over budget`;
    el.shoppingBudgetStatus.className = remaining >= 0 ? "budget-ok" : "budget-over";
  }

  el.shoppingFormMessage.textContent = "";
}

function openShoppingMode(id) {
  if (!state.user) return openAuthDialog();
  const list = state.groceryLists.find((entry) => entry.id === id);
  if (!list || list.status === "completed") return;

  state.shoppingListId = id;
  el.shoppingDialogTitle.textContent = list.name || "Grocery list";
  el.shoppingStoreLabel.textContent = list.storeName ? `Shopping at ${list.storeName}` : "Grocery store not set";
  el.shoppingDate.value = list.shoppingDate || todayISO();
  el.shoppingFormMessage.textContent = "";
  buildShoppingItems(list);

  if (!el.shoppingDialog.open) el.shoppingDialog.showModal();
}

function closeShoppingDialog() {
  if (el.shoppingDialog.open) el.shoppingDialog.close();
  state.shoppingListId = null;
}

async function saveShoppingProgress() {
  const list = state.groceryLists.find((entry) => entry.id === state.shoppingListId);
  if (!list || !state.user || !supabaseClient) return;
  const items = collectShoppingState();
  if (!items) return;
  const shoppingDate = el.shoppingDate.value || todayISO();

  el.saveShoppingProgressBtn.disabled = true;
  el.saveShoppingProgressBtn.textContent = "Saving…";
  try {
    const { error } = await supabaseClient
      .from("grocery_lists")
      .update({
        status: "shopping",
        shopping_date: shoppingDate,
        items,
        updated_at: new Date().toISOString(),
      })
      .eq("id", list.id);
    if (error) throw error;
    await loadGroceryLists();
    const refreshed = state.groceryLists.find((entry) => entry.id === list.id);
    if (refreshed) buildShoppingItems(refreshed);
    showToast("Shopping progress saved.");
  } catch (error) {
    showToast(error.message || "Could not save shopping progress.", "error");
  } finally {
    el.saveShoppingProgressBtn.disabled = false;
    el.saveShoppingProgressBtn.textContent = "Save progress";
  }
}

async function finishShopping() {
  const list = state.groceryLists.find((entry) => entry.id === state.shoppingListId);
  if (!list || !state.user || !supabaseClient) return;
  const items = collectShoppingState({ requirePrices: true });
  if (!items) return;

  const shoppingDate = el.shoppingDate.value;
  if (!shoppingDate) {
    el.shoppingFormMessage.textContent = "Choose the purchase date before finishing.";
    el.shoppingDate.focus();
    return;
  }

  const purchasedItems = items
    .filter((item) => item.purchased)
    .map((item) => ({
      name: item.name,
      price: Number(item.actualPrice ?? 0),
      quantity: item.quantity,
    }));

  el.finishShoppingBtn.disabled = true;
  el.saveShoppingProgressBtn.disabled = true;
  el.finishShoppingBtn.textContent = "Finishing…";

  try {
    const { data: transaction, error: insertError } = await supabaseClient
      .from("grocery_transactions")
      .insert({
        user_id: state.user.id,
        transaction_date: shoppingDate,
        store_name: list.storeName || null,
        items: purchasedItems,
      })
      .select("id")
      .single();
    if (insertError) throw insertError;

    const { error: listError } = await supabaseClient
      .from("grocery_lists")
      .update({
        status: "completed",
        shopping_date: shoppingDate,
        items,
        transaction_id: transaction.id,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", list.id);
    if (listError) throw listError;

    closeShoppingDialog();
    await loadCloudTransactions();
    await loadGroceryLists();
    showToast("Shopping finished. The purchase is now in Transaction History.");
    document.querySelector("#historySection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    el.shoppingFormMessage.textContent = error.message || "Could not finish this shopping trip.";
    showToast(el.shoppingFormMessage.textContent, "error");
  } finally {
    el.finishShoppingBtn.disabled = false;
    el.saveShoppingProgressBtn.disabled = false;
    el.finishShoppingBtn.textContent = "Finish shopping";
  }
}

async function loadGroceryLists() {
  if (!state.user || !supabaseClient) {
    state.groceryLists = [];
    renderGroceryLists();
    return;
  }

  state.loading = true;
  updateAccountUI();
  renderGroceryLists();

  try {
    const { data, error } = await supabaseClient
      .from("grocery_lists")
      .select("id, list_name, planned_date, shopping_date, store_name, budget, status, items, transaction_id, created_at, updated_at, completed_at")
      .order("created_at", { ascending: false });
    if (error) throw error;

    state.groceryLists = (data || []).map((row) => ({
      id: row.id,
      name: row.list_name,
      plannedDate: row.planned_date,
      shoppingDate: row.shopping_date,
      storeName: row.store_name || "",
      budget: row.budget === null ? null : Number(row.budget),
      status: row.status || "planned",
      items: Array.isArray(row.items) ? row.items.map(normalizeListItem) : [],
      transactionId: row.transaction_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at,
    }));
  } catch (error) {
    console.error(error);
    setSyncStatus("Sync error", "error");
    showToast("Could not sync your grocery lists. Run the updated supabase.sql and try again.", "error");
    state.groceryLists = [];
  } finally {
    state.loading = false;
    updateAccountUI();
    renderGroceryLists();
  }
}


function renderAll() {
  renderMetrics();
  renderGroceryLists();
  renderTransactions();
  updateAccountUI();
}

async function initAuth() {
  if (!supabaseClient) {
    state.transactions = [];
    renderAll();
    return;
  }

  setSyncStatus("Checking session…", "loading");
  const { data } = await supabaseClient.auth.getSession();
  state.user = data.session?.user || null;
  updateAccountUI();
  if (state.user) {
    await loadCloudTransactions();
    await loadGroceryLists();
  } else {
    state.groceryLists = [];
    renderAll();
  }

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    const previousUserId = state.user?.id;
    state.user = session?.user || null;
    if (state.user?.id !== previousUserId) {
      state.transactions = [];
      state.groceryLists = [];
      state.expandedIds.clear();
      updateAccountUI();
      if (state.user) {
        await loadCloudTransactions();
        await loadGroceryLists();
      } else {
        renderAll();
      }
    }
  });
}

function init() {
  const now = new Date();
  el.specificMonthInput.value = monthKey(now);
  el.specificYearInput.value = String(now.getFullYear());

  el.newTransactionBtn.addEventListener("click", () => openTransactionDialog());
  el.mobileNewTransactionBtn.addEventListener("click", () => openTransactionDialog());
  el.emptyNewTransactionBtn.addEventListener("click", () => openTransactionDialog());

  [el.newListBtn, el.sectionNewListBtn, el.emptyNewListBtn, el.mobileNewListBtn]
    .filter(Boolean)
    .forEach((button) => button.addEventListener("click", () => openListDialog()));
  el.addListItemBtn.addEventListener("click", () => addListItemRow());
  el.listForm.addEventListener("submit", handleListSubmit);
  el.closeListDialogBtn.addEventListener("click", closeListDialog);
  el.cancelListDialogBtn.addEventListener("click", closeListDialog);
  el.listSearchInput.addEventListener("input", renderGroceryLists);
  el.listStatusFilter.addEventListener("change", renderGroceryLists);
  el.closeShoppingDialogBtn.addEventListener("click", closeShoppingDialog);
  el.saveShoppingProgressBtn.addEventListener("click", saveShoppingProgress);
  el.finishShoppingBtn.addEventListener("click", finishShopping);
  el.cancelDeleteListBtn.addEventListener("click", () => {
    state.pendingListDeleteId = null;
    el.deleteListDialog.close();
  });
  el.confirmDeleteListBtn.addEventListener("click", deletePendingList);
  el.addItemBtn.addEventListener("click", () => addItemRow());
  el.closeDialogBtn.addEventListener("click", closeTransactionDialog);
  el.cancelDialogBtn.addEventListener("click", closeTransactionDialog);
  el.transactionForm.addEventListener("submit", handleTransactionSubmit);

  el.periodSelect.addEventListener("change", syncPeriodControls);
  el.specificMonthInput.addEventListener("change", renderMetrics);
  el.specificYearInput.addEventListener("input", renderMetrics);
  el.searchInput.addEventListener("input", renderTransactions);
  el.sortSelect.addEventListener("change", renderTransactions);

  el.cancelDeleteBtn.addEventListener("click", () => {
    state.pendingDeleteId = null;
    el.deleteDialog.close();
  });
  el.confirmDeleteBtn.addEventListener("click", deletePendingTransaction);

  el.authBtn.addEventListener("click", () => state.user ? openAccountDialog() : openAuthDialog());
  el.authForm.addEventListener("submit", handleAuthSubmit);
  el.authSwitchBtn.addEventListener("click", () => setAuthMode(state.authMode === "signin" ? "signup" : "signin"));
  el.closeAuthDialogBtn.addEventListener("click", () => el.authDialog.close());
  el.closeAccountBtn.addEventListener("click", () => el.accountDialog.close());
  el.signOutBtn.addEventListener("click", signOut);

  el.transactionDialog.addEventListener("click", (event) => {
    if (event.target === el.transactionDialog) closeTransactionDialog();
  });
  el.deleteDialog.addEventListener("click", (event) => {
    if (event.target === el.deleteDialog) {
      state.pendingDeleteId = null;
      el.deleteDialog.close();
    }
  });
  el.listDialog.addEventListener("click", (event) => {
    if (event.target === el.listDialog) closeListDialog();
  });
  el.shoppingDialog.addEventListener("click", (event) => {
    if (event.target === el.shoppingDialog) closeShoppingDialog();
  });
  el.deleteListDialog.addEventListener("click", (event) => {
    if (event.target === el.deleteListDialog) {
      state.pendingListDeleteId = null;
      el.deleteListDialog.close();
    }
  });

  el.authDialog.addEventListener("click", (event) => {
    if (event.target === el.authDialog) el.authDialog.close();
  });
  el.accountDialog.addEventListener("click", (event) => {
    if (event.target === el.accountDialog) el.accountDialog.close();
  });

  // Keep legacy browser-only data untouched so users can manually preserve it if needed.
  // Cloud records become the source of truth after sign-in.
  if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
    console.info("Legacy local grocery data is still present in this browser. It has not been deleted.");
  }

  renderAll();
  initAuth();
}

init();
