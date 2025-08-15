---
applyTo: '**/*.js'
---

# Copilot Instructions for WME LevelReset

## Project Overview
WME LevelReset+ is a Tampermonkey userscript that automatically corrects lock levels of road segments and POIs in the Waze Map Editor based on external rules stored in Google Sheets. Key features:
- **SDK-Dependent**: Requires WME JavaScript SDK - script will not function without it
- Fetches locking rules from external Google Sheets API (`script.googleusercontent.com`)
- Supports city-scoped rules and multiple road types (including Ukraine-specific rules)
- Uses WME JavaScript SDK for all WME interactions (no fallback mechanisms)
- Provides UI in WME sidebar for batch re-locking operations

## Architecture & Data Flow

### Core Components
1. **Bootstrap & Initialization** (`LevelReset_bootstrap()`, `LevelReset_init()`):
   - Waits for `unsafeWindow.SDK_INITIALIZED` promise
   - Validates required SDK components: DataModel, Events, State, Editing, Map
   - Waits for `wme-ready` and `wme-map-data-loaded` events before proceeding

2. **External Rules System**:
   - `getAllLockRules()` - Fetches rules from Google Sheets via `GM_xmlhttpRequest`
   - URL pattern: `https://script.google.com/macros/s/${rulesHash}/exec?func=getAllLockRules`
   - Rules stored in `rulesDB` object, keyed by country abbreviation
   - Fallback to `defaultLocks` object when rules unavailable

3. **Scanning Engine**:
   - `scanArea()` - Processes visible segments/venues using SDK DataModel
   - Uses `onScreen()` geometry checking for viewport filtering
   - Populates `relockObject` with update actions for individual processing

4. **Lock Level Logic**:
   - `setLockLevel()` - Core business logic comparing current vs desired lock levels
   - Respects user editor rank (`userlevel > desiredLockLevel`)
   - Creates individual SDK update actions for each segment/venue

### Road Type Mapping
**CRITICAL REQUIREMENT**: Script depends entirely on SDK availability - no fallback mechanisms needed.

Uses dynamic `streets` object populated from `wmeSDK.DataModel.Segments.getRoadTypes()`:
```js
// Dynamic road type mapping loaded from SDK
let streets = {};

// Initialized via: streets = initializeRoadTypes();
// Structure: { [roadTypeId]: { typeName: "Street", scan: true, sdkType: roadTypeId } }
// Special case: { 90000: { typeName: "POI", scan: true, sdkType: null } }
```

Road types are:
- **Dynamically loaded** from SDK during initialization
- **Locale-aware** - names change based on user's WME language
- **Auto-updating** - includes new road types added to WME
- **SDK-dependent** - script will not function without working SDK

## Critical SDK Usage Patterns

### Initialization Pattern
```js
// Global SDK instance - initialized once and used by all functions
let wmeSDK;

// Always use this exact pattern for SDK initialization
wmeSDK = getWmeSdk({
  scriptId: SCRIPT_ID, // Generated from GM_info.script.name
  scriptName: GM_info.script.name
});

// Wait for WME events before proceeding
await wmeSDK.Events.once({ eventName: "wme-ready" });
await wmeSDK.Events.once({ eventName: "wme-map-data-loaded" });
```

### Data Model Access
```js
// Get all visible segments/venues
const segments = wmeSDK.DataModel.Segments.getAll();
const venues = wmeSDK.DataModel.Venues.getAll();

// Permission checking before updates
if (!wmeSDK.DataModel.Segments.hasPermissions("EDIT_GEOMETRY", segment.id)) {
  return false;
}

// Update segment lock levels
await wmeSDK.DataModel.Segments.updateSegment({
  segmentId: segment.id,
  lockRank: newLockRank
});
```

### UI Integration
```js
// Sidebar registration (returns Promise)
const { tabLabel, tabPane } = await wmeSDK.Sidebar.registerScriptTab({
  tabLabel: 'Re-lock Segments & POI',
  tabPane: document.createElement('div')
});
```

## Important Implementation Notes

### SDK Limitations
- SDK doesn't support batch operations - process features individually
- Road type constants are not directly accessible in userscript context, use numeric IDs
- Event names must match exactly: `wme-ready`, `wme-map-data-loaded`
- Permission checking is required before any geometry edits

### Processing Flow
1. Wait for SDK initialization and WME readiness
2. Fetch external rules from Google Sheets (with fallback to defaults)
3. Scan visible area for segments/venues needing lock updates  
4. Process each feature individually with proper error handling
5. Update UI to reflect changes

### Global Variables
- `wmeSDK`: Single global SDK instance used throughout script
- `rulesDB`: External rules fetched from Google Sheets
- `relockObject`: Collection of features to process (not batch processed)
- `userlevel`: Current user's editor level + 1

## Development Conventions

### Storage Keys Pattern
All localStorage keys use `Relock_` prefix defined in `ID_KEYS` constant:
```js
const ID_KEYS = {
  MSG_HIDE: 'Relock_msgHide',
  ALL_SEGMENTS: 'Relock_allSegments',
  RESPECT_ROUTING: 'Relock_respectRouting',
  ELM_PREFIX: 'Relock_',
  ELM_CHK: '_chk',
  ELM_VALUE: '_value'
};
```

### Error Handling Strategy
**CRITICAL: All error handling must use the centralized ErrorHandler system**

The script implements a centralized error handling system through the `ErrorHandler` object with the following patterns:

1. **Error Severity Levels**:
   - `CRITICAL`: Fatal errors that prevent script functionality (shows user alert)
   - `ERROR`: Errors affecting functionality but allowing continuation 
   - `WARNING`: Potential issues that don't break functionality
   - `INFO`: Informational messages

2. **Required Error Handling Patterns**:
   ```js
   // For synchronous functions
   function myFunction() {
     return ErrorHandler.wrapSync(() => {
       // function logic here
     }, 'Function Name', ErrorHandler.SEVERITY.ERROR, defaultReturnValue)();
   }

   // For async functions  
   const myAsyncFunction = ErrorHandler.wrapAsync(async () => {
     // async function logic here
   }, 'Async Function Name', ErrorHandler.SEVERITY.ERROR);

   // Manual error handling
   ErrorHandler.handle(error, 'Context Description', ErrorHandler.SEVERITY.ERROR, showUserAlert, additionalInfo);
   ```

3. **Forbidden Patterns**:
   - ❌ Direct `console.error()`, `console.warn()`, `console.log()` calls
   - ❌ Direct `alert()` calls for errors
   - ❌ Inconsistent error message formatting
   - ❌ Try/catch without using ErrorHandler

4. **SDK Error Handling**: 
   - Always wrap SDK calls in ErrorHandler patterns
   - Use appropriate severity levels (CRITICAL for initialization, ERROR for operations, WARNING for non-essential features)
   - Provide meaningful context descriptions for debugging

5. **User-Facing Errors**: 
   - CRITICAL errors automatically show user alerts
   - Other errors can show alerts via `showUser: true` parameter
   - Use descriptive, user-friendly error messages

### Async/Promise Patterns
- Functions dealing with SDK are `async`
- External HTTP requests wrapped in Promise for callback → async conversion
- Use `Promise.all()` for parallel SDK event waiting

## Key Integration Points

### Tampermonkey-specific
- `GM_xmlhttpRequest` for Google Sheets API calls (bypasses CORS)
- `GM_addStyle` for CSS injection with fallback to manual `<style>` element
- `unsafeWindow` required when using `@grant` permissions other than `none`
- `GM_info.script.name/version` for script metadata

### Google Sheets Integration
- Rules fetched via Apps Script web app endpoint
- Response format: `{ result: "success", rules: {...} }` 
- Timeout handling: `requestsTimeout` constant controls request duration
- Validates Content-Type headers for JSON vs HTML responses

## Common Pitfalls & Solutions

1. **SDK Timing**: Always wait for `SDK_INITIALIZED` promise and required WME events before SDK usage
2. **Permission Checking**: Use `hasPermissions()` before attempting segment/venue updates
3. **Viewport Filtering**: Use `onScreen()` function to limit processing to visible features
4. **User Level Validation**: Check `userlevel > desiredLockLevel` before applying lock changes
5. **Individual Processing**: Process updates individually since SDK doesn't support batch operations

## File Structure
- `WME LevelReset.user.js` - Single-file userscript (1300+ lines)
- `WME_SDK_DOCUMENTATION.md` - Local SDK reference documentation
- `README.md` - Basic project description and differences from original
- `.github/instructions/copilot.instructions.md` - Development guidelines and patterns

When making changes, ensure all SDK interactions follow the documented patterns in `WME_SDK_DOCUMENTATION.md` and test with the specific Google Sheets rules integration.

## Formatting Guidelines
Always follow JavaScript formatting guidelines for all code edits and generation in this project. Use consistent indentation, semicolons, and code style as found in the existing codebase.
