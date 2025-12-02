# 🔧 How to Fix Remaining Fetch Calls

## Problem
Your frontend is trying to fetch data without JWT token authentication. The backend now requires authentication.

## Solution
Replace all `fetch()` calls with `apiClient.fetch()` or use the specific methods like `apiClient.get()`.

---

## Quick Fix Pattern

### Before (❌ Not Authenticated)
```javascript
const response = await fetch('http://localhost:8000/categories/');
```

### After (✅ Authenticated)
```javascript
import apiClient from '../utils/apiClient';

const response = await apiClient.get('http://localhost:8000/categories/');
```

---

## Files That Need Updating

### 1. **`src/components/CSVUpload/CSVUpload.js`** - Line 25
```javascript
// Before
const response = await fetch('http://localhost:8000/transactions/upload-csv/', {
    method: 'POST',
    body: formData
});

// After
import apiClient from '../../utils/apiClient';

const response = await apiClient.fetch('http://localhost:8000/transactions/upload-csv/', {
    method: 'POST',
    body: formData
});
```

### 2. **`src/components/CategoryManagement/CategoryManagement.js`** - Line 115
```javascript
// Before
const response = await fetch(`http://localhost:8000/categories/${categoryId}`, {
    method: 'DELETE'
});

// After
import apiClient from '../../utils/apiClient';

const response = await apiClient.delete(`http://localhost:8000/categories/${categoryId}`);
```

### 3. **`src/components/Budget/BudgetSetup/BudgetSetup.js`** - Line 103, 250
```javascript
// Before
const response = await fetch(`http://localhost:8000/budgets/yearly/${year}`);

// After
import apiClient from '../../../utils/apiClient';

const response = await apiClient.get(`http://localhost:8000/budgets/yearly/${year}`);
```

### 4. **`src/components/Budget/BudgetList/BudgetList.js`** - Line 46, 79
```javascript
// Before
const response = await fetch(`http://localhost:8000/budgets/?month=${selectedMonth}&year=${selectedYear}`);

// After
import apiClient from '../../../utils/apiClient';

const response = await apiClient.get(`http://localhost:8000/budgets/?month=${selectedMonth}&year=${selectedYear}`);
```

### 5. **`src/components/Budget/BudgetOverview/BudgetOverview.js`** - Line 52
```javascript
// Before
const response = await fetch(`http://localhost:8000/budgets/summary?month=${selectedMonth}&year=${selectedYear}`);

// After
import apiClient from '../../../utils/apiClient';

const response = await apiClient.get(`http://localhost:8000/budgets/summary?month=${selectedMonth}&year=${selectedYear}`);
```

### 6. **`src/components/Budget/BudgetComparison/BudgetComparison.js`** - Line 66, 205
```javascript
// Before
const response = await fetch(`http://localhost:8000/budgets/summary?month=${month}&year=${year}`);

// After
import apiClient from '../../../utils/apiClient';

const response = await apiClient.get(`http://localhost:8000/budgets/summary?month=${month}&year=${year}`);
```

### 7. **`src/pages/TransactionsPage.js`** (if it has fetch calls)
Look for `fetch('http://localhost:8000/transactions` and replace with `apiClient`

### 8. **Any other `.js` files in `src/components`**
Search for `fetch('http://localhost:8000` and replace with `apiClient`

---

## Step-by-Step Guide

For each file:

1. **Add import at top:**
   ```javascript
   import apiClient from '../../utils/apiClient'; // Adjust path as needed
   ```

2. **Replace fetch calls:**
   - `fetch(url)` → `apiClient.get(url)`
   - `fetch(url, { method: 'GET' })` → `apiClient.get(url)`
   - `fetch(url, { method: 'POST', body: JSON.stringify(data) })` → `apiClient.post(url, data)`
   - `fetch(url, { method: 'PUT', body: JSON.stringify(data) })` → `apiClient.put(url, data)`
   - `fetch(url, { method: 'DELETE' })` → `apiClient.delete(url)`

3. **For POST with FormData (CSV uploads):**
   ```javascript
   // FormData doesn't need apiClient.post, use apiClient.fetch directly
   const response = await apiClient.fetch(url, {
     method: 'POST',
     body: formData  // FormData handles its own headers
   });
   ```

---

## Path Hints

| File Location | Import Path |
|---------------|------------|
| `src/pages/*.js` | `import apiClient from '../utils/apiClient';` |
| `src/components/**/*.js` | `import apiClient from '../../utils/apiClient';` |
| `src/hooks/**/*.js` | `import apiClient from '../../utils/apiClient';` |
| `src/components/Budget/**/*.js` | `import apiClient from '../../../utils/apiClient';` |

---

## Benefits of This Approach

✅ **Centralized**: All API calls use same authentication  
✅ **DRY**: No need to add headers to every fetch call  
✅ **Easy to maintain**: Change auth logic once, affects everywhere  
✅ **Automatic**: JWT token added automatically from localStorage  
✅ **Type-safe**: Can add TypeScript later  

---

## Testing After Updates

1. Register a new user at `/register`
2. Log in with those credentials
3. Try to:
   - View dashboard (categories/budgets should load)
   - Add a transaction
   - Create a budget
   - Upload CSV

All should work with authenticated requests!

---

## Quick Count of Files

Run this in terminal to see all fetch calls:
```bash
grep -r "fetch('http://localhost:8000" src/ --include="*.js" | wc -l
```

Each line needs updating!

---

**Need help?** Look at the updated files:
- ✅ `src/App.js` - Already updated
- ✅ `src/hooks/useDashboardData/useDashboardData.js` - Already updated
- ✅ `src/pages/BudgetPage/BudgetPage.js` - Already updated
- ✅ `src/utils/apiClient.js` - New file (use this!)

Copy the pattern from these files for the others!
