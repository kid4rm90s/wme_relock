# Copilot Instructions for WME LevelReset

## Project Overview
WME LevelReset+ is a Tampermonkey userscript that automatically corrects lock levels of road segments and POIs in the Waze Map Editor based on external rules stored in Google Sheets. Key features:
- Fetches locking rules from external Google Sheets API (`script.googleusercontent.com`)
- Supports city-scoped rules and multiple road types (including Ukraine-specific rules)
- Uses WME JavaScript SDK for all WME interactions
- Provides UI in WME sidebar for batch re-locking operations

## Architecture & Data Flow

### Core Components
1. **Bootstrap & Initialization** (`LevelReset_bootstrap()`, `LevelReset_init()`):
   - Waits for `unsafeWindow.SDK_INITIALIZED` promise
   - Validates required SDK components: DataModel, Events, State, Editing, Map
   - Waits for `wme-ready`, `wme-map-ready`, `wme-data-ready` events

2. **External Rules System**:
   - `getAllLockRules()` - Fetches rules from Google Sheets via `GM_xmlhttpRequest`
   - URL pattern: `https://script.google.com/macros/s/${rulesHash}/exec?func=getAllLockRules`
   - Rules stored in `rulesDB` object, keyed by country abbreviation
   - Fallback to `defaultLocks` object when rules unavailable

3. **Scanning Engine**:
   - `scanArea()` - Processes visible segments/venues using SDK DataModel
   - Uses `onScreen()` geometry checking for viewport filtering
   - Populates `relockObject` with update actions for batch processing

4. **Lock Level Logic**:
   - `setLockLevel()` - Core business logic comparing current vs desired lock levels
   - Respects user editor rank (`userlevel > desiredLockLevel`)
   - Creates SDK update actions: `wmeSDK.DataModel.createUpdateAction(feature, { lockRank: desiredLockLevel })`

### Road Type Mapping
Uses `streets` object mapping SDK RoadTypeId constants to internal type names:
```js
const streets = {
  [wmeSDK.DataModel.RoadTypes.PRIVATE_ROAD]: { typeName: "Private", scan: true, sdkType: "PRIVATE_ROAD" },
  90000: { typeName: "POI", scan: true, sdkType: null } // Special POI handling
}
```

## Critical SDK Usage Patterns

### Initialization Pattern
```js
// Always use this exact pattern for SDK initialization
const wmeSDK = getWmeSdk({
  scriptId: SCRIPT_ID, // Generated from GM_info.script.name
  scriptName: GM_info.script.name
});

// Wait for multiple events before proceeding
await Promise.all([
  wmeSDK.Events.once({ eventName: "wme-map-ready" }),
  wmeSDK.Events.once({ eventName: "wme-data-ready" })
]);
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
await wmeSDK.DataModel.Segments.update({
  objectId: segment.id,
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

## Development Conventions

### Storage Keys Pattern
All localStorage keys use `Relock_` prefix defined in `STORAGE_KEYS` constant:
```js
const STORAGE_KEYS = {
  MSG_HIDE: 'Relock_msgHide',
  ALL_SEGMENTS: 'Relock_allSegments',
  ROAD_TYPE_PREFIX: 'Relock_', // Combined with road type names
  ROAD_TYPE_SUFFIX: '_chk'
};
```

### Error Handling Strategy
- Always wrap SDK calls in try/catch blocks
- Use `console.error()` for logging with 'LevelReset:' prefix
- Display user-facing errors via `alert()` for critical failures
- Graceful fallbacks: external rules → defaultLocks, GM_addStyle → manual style injection

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
5. **Batch Processing**: Collect updates in `relockObject` arrays, then apply via SDK batch operations

## File Structure
- `WME LevelReset.user.js` - Single-file userscript (1200+ lines)
- `WME_SDK_DOCUMENTATION.md` - Local SDK reference documentation
- `README.md` - Basic project description and differences from original

When making changes, ensure all SDK interactions follow the documented patterns in `WME_SDK_DOCUMENTATION.md` and test with the specific Google Sheets rules integration.

## Formatting Guidelines
Always follow JavaScript formatting guidelines for all code edits and generation in this project. Use consistent indentation, semicolons, and code style as found in the existing codebase.
