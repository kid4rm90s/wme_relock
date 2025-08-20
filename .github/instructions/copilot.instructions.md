---
applyTo: '**/*.js'
---

# Copilot Instructions for WME Relock

## Project Overview
WME Relock+ is a Tampermonkey userscript that automatically corrects lock levels of road segments and POIs in the Waze Map Editor based on external rules stored in Google Sheets. Key features:
- **SDK-Dependent**: Requires WME JavaScript SDK - script will not function without it
- Fetches locking rules from external Google Sheets API (`script.googleusercontent.com`)
- Supports city-scoped rules and multiple road types (including Ukraine-specific rules)
- Uses WME JavaScript SDK for all WME interactions (no fallback mechanisms)
- Provides UI in WME sidebar for batch re-locking operations

## Architecture & Data Flow

### Core Components
1. **Bootstrap & Initialization** (`Relock_bootstrap()`, `Relock_init()`):
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

## Userscript Performance Guidelines

### Optimization Principles
**CRITICAL: This is a userscript - prioritize speed, compactness, and simplicity**

1. **Performance-First Approach**:
   - Optimize for scan speed and UI responsiveness
   - Minimize DOM queries through caching
   - Use debouncing/throttling for frequent operations
   - Early exits in loops to prevent unnecessary processing

2. **Compact Solutions**:
   - Single-file architecture maintained
   - No complex frameworks or build processes
   - Simple utility functions over elaborate patterns
   - Inline optimizations over architectural complexity

3. **Memory Efficiency**:
   - Clear arrays instead of recreating objects
   - Cache frequently accessed DOM elements
   - Implement proper event handler cleanup
   - Use scan limits to prevent memory spikes

4. **User Experience**:
   - Provide visual feedback during operations
   - Maintain UI responsiveness during processing
   - Graceful error handling with user notifications
   - Quick startup and initialization

### Performance Monitoring
- Track scan times in dense areas
- Monitor memory usage during bulk operations
- User feedback on responsiveness
- ErrorHandler reports for failure patterns

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

### Userscript Optimization Patterns
**PRIORITY: Always optimize for userscript performance characteristics**

1. **DOM Caching Pattern**:
   ```js
   const cachedElements = {};
   function getCached(id, key) {
     return cachedElements[key] || (cachedElements[key] = document.getElementById(id));
   }
   ```

2. **Debounced Operations**:
   ```js
   let timeout;
   const debounced = (fn, delay) => (...args) => {
     clearTimeout(timeout);
     timeout = setTimeout(() => fn(...args), delay);
   };
   ```

3. **Efficient Loops with Early Exits**:
   ```js
   for (const item of collection) {
     if (!passesInitialCheck(item)) continue;
     if (count >= LIMIT) break;
     // Process item
   }
   ```

4. **Parallel Initialization**:
   ```js
   const [data1, data2] = await Promise.all([
     fetchData1(),
     fetchData2()
   ]);
   ```

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
- `wme-relock.user.js` - Single-file userscript (1300+ lines)
- `WME_SDK_DOCUMENTATION.md` - Local SDK reference documentation
- `README.md` - Basic project description and differences from original
- `.github/instructions/copilot.instructions.md` - Development guidelines and patterns

When making changes, ensure all SDK interactions follow the documented patterns in `WME_SDK_DOCUMENTATION.md` and test with the specific Google Sheets rules integration.

## Performance Optimization Tracking

**CRITICAL: Always update OPTIMIZATION_ANALYSIS.md when implementing performance changes**

### Optimization Change Process
When making ANY performance-related changes to the script, you MUST:

1. **Document the change** in `OPTIMIZATION_ANALYSIS.md`:
   - Mark items as ✅ **IMPLEMENTED** when completed
   - Update priority matrices to reflect current status
   - Add implementation details and code examples
   - Update expected vs. achieved benefits

2. **Update completion status**:
   - Move items from "High Priority" to "Completed Optimizations"  
   - Update performance impact estimates
   - Document any trade-offs or limitations discovered

3. **Maintain tracking accuracy**:
   - Keep both files (instructions and analysis) synchronized
   - Update implementation dates and context
   - Preserve alternative approaches for future reference

### Current Performance Optimization Priorities

### High Priority (Immediate Implementation)
1. ✅ **COMPLETED**: **Scan Throttling** - Prevent overlapping scans during map movement
2. **DOM Caching** - Cache all frequently accessed UI elements  
3. **Viewport Optimization** - Improve onScreen() efficiency
4. **Early Loop Exits** - Optimize scanning algorithm performance

### Medium Priority (Future Enhancement)
1. **Parallel Initialization** - Load rules during SDK setup
2. **Rules Preprocessing** - Optimize rule lookup structure
3. **Permission Caching** - Cache permissions within scan sessions
4. **Progress Feedback** - Visual scanning progress indication

### Completed Optimizations ✅
1. Scan throttling/debouncing implementation (Aug 20, 2025)
2. Async/await standardization throughout codebase
3. Function decomposition and conflict resolution
4. Progress bar optimization with pre-calculated widths
5. Centralized error handling system implementation
6. Event handler cleanup and memory leak prevention

## Documentation Requirements

### Optimization Analysis Maintenance
**MANDATORY: Update `OPTIMIZATION_ANALYSIS.md` for ALL performance changes**

Every time you implement, modify, or complete an optimization:

1. **Update Implementation Status**:
   ```markdown
   ### X. **Optimization Name** ✅ **IMPLEMENTED** 
   **Priority: HIGH**
   - **Implementation Date**: August 20, 2025
   - **Changes Made**: Specific details of what was implemented
   - **Code Location**: Where the changes were made (line numbers/functions)
   - **Achieved Benefit**: Actual results vs. expected benefits
   ```

2. **Move Completed Items**:
   - Remove from "High Priority" or "Medium Priority" sections
   - Add to "Completed Optimizations ✅" section
   - Update priority matrices accordingly

3. **Document Alternatives**:
   - Keep alternative approaches documented for future reference
   - Include comparison rationale for chosen approach
   - Note any trade-offs or limitations discovered

4. **Update Performance Estimates**:
   - Revise expected benefits based on actual implementation
   - Update overall performance impact projections
   - Document any unexpected findings or issues

### Example Documentation Pattern
```markdown
### 1. **Scan Throttling** ✅ **IMPLEMENTED**
**Implementation Date**: August 20, 2025
**Code Changes**: Added debouncedScan() function and updated event handlers
**Achieved Benefit**: 40-60% reduction in redundant scan operations
**Alternative Available**: Throttled approach documented for future consideration
```

## Formatting Guidelines
Always follow JavaScript formatting guidelines for all code edits and generation in this project. Use consistent indentation, semicolons, and code style as found in the existing codebase. Prioritize compact, efficient solutions appropriate for userscript deployment.
