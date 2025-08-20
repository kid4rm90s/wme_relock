# ESLint Setup for WME Relock Userscript

This project uses **globally installed ESLint** to detect undeclared variables, scope issues, and maintain code quality while keeping the project dependency-free.

## Prerequisites

Install ESLint globally if you haven't already:
```bash
npm install -g eslint
```

## Usage

```bash
# Check for lint errors
npm run lint
# or
eslint *.js

# Auto-fix issues
npm run lint:fix  
# or
eslint *.js --fix
```

## Userscript-Specific Configuration

### Global Variables
ESLint is configured to recognize userscript and browser environments:

**Userscript/Greasemonkey globals:**
- `GM_info`, `GM_xmlhttpRequest`, `GM_addStyle`, `unsafeWindow`, `getWmeSdk`

**Browser globals:**
- `localStorage`, `window`, `document`, `console`, `setTimeout`, etc.

**Waze Map Editor globals:**
- `W`, `WazeWrap`, `OpenLayers`, `$`, `jQuery`

### Key Linting Rules

- **`no-undef`** (ERROR): Catches undeclared variables - prevents typos like `scnaArea` instead of `scanArea`
- **`no-unused-vars`** (WARNING): Warns about unused variables (ignores variables prefixed with `_`)
- **`no-use-before-define`** (ERROR): Prevents using variables before declaration
- **`block-scoped-var`** (ERROR): Treats `var` as block-scoped for better scope management
- **`no-global-assign`** (ERROR): Prevents assignment to native objects
- **`no-implicit-globals`** (ERROR): Prevents accidental global declarations
- **`no-alert`** (WARNING): Warns about alert usage (with ignore comments for intentional use)

## VS Code Integration

- ESLint automatically highlights errors and warnings in VS Code
- Use `Ctrl+Shift+P` → "Tasks: Run Task" → "ESLint: Check for errors"
- Auto-fix on save is enabled for supported rules
