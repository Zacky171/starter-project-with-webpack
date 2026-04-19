# Project Instructions

## Navigation Visibility Based on Authentication

### Overview
Navigation items in this project are controlled by authentication state using CSS classes and JavaScript logic in the app presenter. The visibility rules ensure:
- **Before login:** Only authentication controls are visible (Login, Register)
- **After login:** Story-related items (Stories, Tambah Story) and Logout are visible; authentication controls are hidden

### Navigation Item Classes

Use these CSS classes in [index.html](src/index.html) to control visibility behavior:

#### `story-item`
- Applied to story-related navigation items that should be visible after login.
- **Examples:** "Stories" (`#/stories`), "Tambah Story" (`#/add`)
- **Visibility:** 
  - Before login: Hidden
  - After login: Visible

#### `auth-item`
Applied to authentication controls visible before login.
- **Examples:** "Login" (`#/login`), "Register" (`#/register`)
- **Visibility:**
  - Before login: Visible
  - After login: Hidden

#### `logout-li`
Applied to the logout button container. Managed by JavaScript in [src/scripts/pages/app.js](src/scripts/pages/app.js).
- **Visibility:**
  - Before login: Hidden
  - After login: Visible

### Implementation

**File: [src/index.html](src/index.html#L23-L32)**
```html
<nav role="navigation" aria-label="Main navigation">
  <ul>
    <li class="story-item"><a href="#/stories" data-nav>Stories</a></li>
    <li class="logout-li" style="display: none;">
      <a href="#" class="logout btn btn-secondary">Logout</a>
    </li>
    <li class="story-item"><a href="#/add" data-nav>Tambah Story</a></li>
    <li class="auth-item"><a href="#/login" data-nav>Login</a></li>
    <li class="auth-item"><a href="#/register" data-nav>Register</a></li>
  </ul>
</nav>
```

**File: [src/scripts/pages/app.js](src/scripts/pages/app.js#L33-L69)**

The `updateLogoutButton()` function:
1. Queries all story items by `.story-item` class
2. Queries auth items by `.auth-item` class
3. Queries logout element by `.logout-li` class
4. Shows/hides based on `isLoggedIn()` state from [src/scripts/utils/auth.js](src/scripts/utils/auth.js)

**Behavior:**
- When user logs in → Hide auth items; show story items & Logout
- When user logs out → Show auth items, hide story items & Logout

### Adding New Navigation Items

If you add new navigation items:

1. **For story/protected features after login:** Use class `story-item`
2. **For authentication controls:** Use class `auth-item`
3. **No custom logic needed** — The existing JavaScript in `app.js` will automatically handle visibility

### Related Files
- [src/scripts/pages/app.js](src/scripts/pages/app.js) — MVP presenter that controls nav visibility
- [src/scripts/utils/auth.js](src/scripts/utils/auth.js) — Authentication utility (`isLoggedIn()`, `logout()`)
- [src/scripts/routes/routes.js](src/scripts/routes/routes.js) — Route guards for protected pages

### Route Protection
Story routes (`#/stories`, `#/add`) are also protected in the router. Unauthenticated users cannot access them even if they modify the URL directly.
