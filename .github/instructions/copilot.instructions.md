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
  INFO_BOX: 'Relock_infoBox',
  ELM_PREFIX: 'Relock_',
  CHECKBOX_SUFFIX: '_checkbox',
  VALUE_SUFFIX: '_value',
  ROAD_TYPE_CONTAINER_SUFFIX: '_roadTypeContainer'
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
- `WME_SDK_DOCUMENTATION.md` - Quick reference and getting started guide for SDK
- `WME_SDK_COMPLETE_OFFLINE_REFERENCE.md` - Comprehensive offline SDK documentation
- `README.md` - Basic project description and differences from original
- `.github/instructions/copilot.instructions.md` - Development guidelines and patterns

When making changes, ensure all SDK interactions follow the documented patterns in `WME_SDK_DOCUMENTATION.md` (for quick reference) and `WME_SDK_COMPLETE_OFFLINE_REFERENCE.md` (for detailed implementation) and test with the specific Google Sheets rules integration.

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

### CSS Styling Guidelines
**CRITICAL: Always use centralized CSS in `rlStyle` array instead of inline styling.**

#### Required Approach:
1. **Add new CSS classes to `rlStyle` array** for all static styling needs
2. **Use class-based CSS selectors** with `rl-` prefix for consistency
3. **Update `rlStyle` array** when adding new UI elements that need styling

#### Allowed Inline Styling (Exceptions Only):
- **Dynamic properties**: `display`, `visibility`, `opacity` for show/hide animations
- **Dynamic colors**: Status-dependent color changes (red/green states)
- **Dynamic dimensions**: Width/height that change based on calculations
- **Animation properties**: Temporary transitions and transforms
- **Positioning adjustments**: Dynamic top/left/margin adjustments

#### Forbidden Inline Styling:
- ❌ Static layout properties: `flexbox`, `grid`, `align-items`, `justify-content`
- ❌ Static sizing: Fixed `width`, `height`, `padding`, `margin`
- ❌ Static typography: `font-size`, `font-weight`, `text-align`
- ❌ Static colors: `background-color`, `border-color` (unless dynamic)
- ❌ Static borders: `border-radius`, `border-width`, `border-style`

#### Implementation Pattern:
```js
// ✅ Correct: Add to rlStyle array
const rlStyle = [
    // existing styles...
    '.rl-scan-counter { font-size: 90%; color: #666; margin-bottom: 5px; }',
];

// ✅ Correct: Use class name
element.className = 'rl-scan-counter';

// ✅ Correct: Dynamic inline styling (exception)
element.style.display = isVisible ? 'block' : 'none';
element.style.color = hasError ? 'red' : 'green';

// ❌ Incorrect: Static inline styling
element.style.fontSize = '90%';  // Should be in CSS class
element.style.marginBottom = '5px';  // Should be in CSS class
```

This approach ensures:
- **Maintainability**: All styling centralized in one location
- **Consistency**: Uniform styling patterns across the script
- **Performance**: Better CSS optimization and caching
- **Flexibility**: Easy global style updates without code changes

## Development Workflow Requirements

### ⚠️ CRITICAL: ESLint and Syntax Checking Rules
**🚫 NEVER run ESLint commands or tasks automatically after code changes.**

#### ✅ ALLOWED:
- Use `get_errors` tool to check for syntax issues
- VS Code's built-in syntax highlighting and error detection
- Manual ESLint runs if specifically requested by user

#### 🚫 FORBIDDEN:
- Running `npx eslint` commands after code changes
- Using `run_task` with ESLint tasks unless explicitly requested
- Automatic linting in terminal as validation step
- Any ESLint execution without user permission

#### Why This Rule Exists:
- User has explicitly requested to stop automatic ESLint execution
- VS Code provides sufficient syntax checking capabilities
- Terminal commands should only run when necessary or requested
- Performance: Avoid unnecessary command executions

### Version Management
**ALWAYS update version numbers after every code change:**
1. **Userscript version** (`@version` in header): Format `YYYY.MM.DD.NNN` where:
   - `YYYY.MM.DD` = current date
   - `NNN` = simple increment (001, 002, 003, etc.)
2. **Package.json version**: Update to match userscript version

**Example version progression:**
- `2025.08.21.001` → `2025.08.21.002` (same day, next change)
- `2025.08.21.005` → `2025.08.22.001` (next day, reset increment)

### Code Change Protocol
1. Make code changes
2. Update version numbers (both files)
3. Use `get_errors` tool if syntax checking needed
4. 🚫 **DO NOT run ESLint automatically**

## WME SDK Documentation Maintenance

### Overview
The project maintains two complementary SDK documentation files:

1. **`WME_SDK_DOCUMENTATION.md`** - Quick reference and getting started guide
   - Compact format (~214 lines) for immediate use
   - Essential setup, common patterns, and troubleshooting
   - Links to comprehensive documentation for details

2. **`WME_SDK_COMPLETE_OFFLINE_REFERENCE.md`** - Complete offline reference
   - Comprehensive documentation (~1000+ lines) with all SDK details
   - Complete API coverage: 35+ classes, 60+ interfaces, 70+ type aliases
   - Detailed examples, migration guides, and complete feature documentation

Both files must be kept synchronized with the official SDK to ensure accuracy for developers working offline or needing quick reference.

### When to Update SDK Documentation
**Triggers for documentation updates:**
1. **User explicitly requests**: "update SDK documentation", "sync with online SDK", "refresh SDK info"
2. **Version discrepancies discovered**: When current SDK version differs from documented version
3. **Missing functionality reported**: When script development reveals undocumented SDK features
4. **Periodic maintenance**: Quarterly reviews recommended for major SDK updates
5. **Migration needs**: When switching between SDK versions for compatibility

### Update Process Protocol

#### Step 1: Discover Current SDK Version
**CRITICAL: Always determine the current SDK version before beginning updates**

```bash
# Use mcp_mcp-web-snaps_website_snapshot to capture the main SDK page
# URL: https://www.waze.com/editor/sdk/modules/index.html
# Look for version information in page title or header
```

**Version Detection Pattern:**
- Page title format: "WME JavaScript SDK v2.XXX-X-gXXXXXXXXXX - WME SDK"
- Compare with current documented version in both documentation files:
  - Quick reference: `WME_SDK_DOCUMENTATION.md` header
  - Complete reference: `WME_SDK_COMPLETE_OFFLINE_REFERENCE.md` header
- Document version changes in update process

#### Step 2: Systematic Documentation Exploration
**MANDATORY: Follow this exact sequence for comprehensive coverage**

1. **Main SDK Index**:
   ```bash
   mcp_mcp-web-snaps_website_snapshot https://www.waze.com/editor/sdk/modules/index.html
   ```

2. **Core Module Discovery**:
   - Capture all module links from main page
   - Systematically snapshot each module page
   - Document new modules not in current reference

3. **Class and Interface Deep Dive**:
   ```bash
   # For each class/interface found, capture detailed pages
   mcp_mcp-web-snaps_website_snapshot https://www.waze.com/editor/sdk/classes/[ClassName].html
   mcp_mcp-web-snaps_website_snapshot https://www.waze.com/editor/sdk/interfaces/[InterfaceName].html
   ```

4. **Type Definitions and Constants**:
   - Capture type alias pages
   - Document new constants and variables
   - Update existing type definitions

#### Step 3: Documentation Structure Update

**File-Specific Update Approach:**

**A. Quick Reference (`WME_SDK_DOCUMENTATION.md`):**
- Update version numbers in header
- Update essential examples if API changes
- Update module table links if structure changes
- Keep content minimal - refer to comprehensive docs for details

**B. Complete Reference (`WME_SDK_COMPLETE_OFFLINE_REFERENCE.md`):**
- **ALWAYS maintain the 7-part structure of the offline reference:**

1. **Part 1: SDK Overview & Core Classes**
   - Update version numbers throughout
   - Add new core classes discovered
   - Update existing class method signatures

2. **Part 2: Data Model Classes**
   - Add new data model classes
   - Update method signatures and parameters
   - Document new properties and events

3. **Part 3: UI & Interaction Classes**
   - Update UI component changes
   - Add new interaction methods
   - Document new event types

4. **Part 4: Interfaces**
   - Add newly discovered interfaces
   - Update existing interface properties
   - Maintain alphabetical organization

5. **Part 5: Type Aliases & Constants**
   - Add new type definitions
   - Update constant values
   - Document new variables

6. **Part 6: Complete API Reference**
   - Update practical examples with new syntax
   - Add examples for new functionality
   - Update best practices based on changes

7. **Part 7: Error Handling & Migration**
   - Add migration notes for version changes
   - Update error handling patterns
   - Document breaking changes

#### Step 4: Validation and Testing
**REQUIRED: Validate documentation accuracy against actual SDK**

1. **Cross-Reference Validation**:
   - Compare method signatures between versions
   - Verify parameter types and requirements
   - Check for deprecated methods or properties

2. **Practical Example Updates**:
   - Test code examples against new SDK version
   - Update deprecated patterns
   - Add examples for new functionality

3. **Breaking Changes Documentation**:
   - Clearly mark deprecated features
   - Document migration paths for breaking changes
   - Update version compatibility notes

#### Step 5: Change Documentation
**MANDATORY: Document all changes made during update process**

**A. Quick Reference Updates:**
- Update version number in header
- Note significant API changes in overview section
- Update links if comprehensive documentation structure changes

**B. Complete Reference Updates:**
- Add a "Documentation Update History" section to track changes:

```markdown
## Documentation Update History

### [Current Date] - SDK v[New Version] Update
**Updated by**: GitHub Copilot
**Trigger**: [User request/version discovery/periodic maintenance]
**Changes made**:
- ✅ Updated from SDK v[Old Version] to v[New Version]
- ✅ Added [X] new classes: [Class names]
- ✅ Added [X] new interfaces: [Interface names]
- ✅ Updated [X] existing methods with new signatures
- ✅ Added [X] new type definitions
- ✅ Documented [X] breaking changes with migration paths
- ✅ Updated [X] practical examples for compatibility

**New functionality discovered**:
- [List new features found]

**Deprecated functionality**:
- [List deprecated methods/properties]

**Migration notes**:
- [Key points for developers updating their scripts]
```

### Update Implementation Strategy

#### Incremental vs. Complete Replacement
**Decision Matrix**:

- **Minor Version Updates** (v2.309 → v2.310):
  - Use incremental updates with `replace_string_in_file`
  - Focus on specific sections with changes
  - Maintain existing structure and examples

- **Major Version Updates** (v2.x → v3.x):
  - Consider complete documentation replacement
  - Backup current version before starting
  - Implement comprehensive restructuring if needed

#### Content Length Management
**CRITICAL: Manage response length to avoid truncation**

1. **Chunked Updates**: Process documentation in sections when dealing with large changes
2. **Focused Responses**: Provide section-by-section updates rather than complete rewrites
3. **Summary First**: Always provide change summary before detailed implementation
4. **User Confirmation**: Ask for confirmation on major structural changes

### Error Handling During Updates

#### Common Issues and Solutions

1. **Website Accessibility Problems**:
   ```bash
   # If main SDK site unavailable, document this clearly
   # Fall back to cached/archived versions if available
   # Note limitations in updated documentation
   ```

2. **Version Detection Failures**:
   - Document inability to determine current version
   - Provide manual version checking instructions
   - Note uncertainty in documentation accuracy

3. **Incomplete Information Capture**:
   - Clearly mark sections with incomplete information
   - Document which areas need manual verification
   - Provide URLs for manual checking

#### Quality Assurance Checklist
**Before completing documentation update:**

**Quick Reference File (`WME_SDK_DOCUMENTATION.md`):**
- [ ] ✅ Version number updated in header
- [ ] ✅ Essential examples updated for API changes
- [ ] ✅ Module table links verified and updated
- [ ] ✅ Cross-references to complete documentation maintained

**Complete Reference File (`WME_SDK_COMPLETE_OFFLINE_REFERENCE.md`):**
- [ ] ✅ Version number updated throughout document
- [ ] ✅ All 7 sections reviewed and updated as needed
- [ ] ✅ New functionality properly documented with examples
- [ ] ✅ Deprecated functionality clearly marked
- [ ] ✅ Breaking changes documented with migration paths
- [ ] ✅ Update history section added/updated
- [ ] ✅ Cross-references between sections maintained
- [ ] ✅ Code examples validated for syntax correctness
- [ ] ✅ User informed of completion and key changes

### Communication Protocol

#### Progress Updates During Long Updates
```markdown
📋 **SDK Documentation Update Progress**

**Phase**: [Current phase - Discovery/Analysis/Implementation]
**Version**: Updating from v[Old] to v[New]
**Progress**: [X] of [Y] sections completed

**Discoveries so far**:
- [Key findings]

**Next steps**:
- [What's coming next]
```

#### Completion Summary
```markdown
✅ **SDK Documentation Update Complete**

**Updated Files**: 
- `WME_SDK_DOCUMENTATION.md` (Quick Reference)
- `WME_SDK_COMPLETE_OFFLINE_REFERENCE.md` (Complete Reference)

**Version**: Now reflects SDK v[New Version]
**Key Changes**: [Major updates discovered]
**Ready for use**: Both quick reference and complete offline documentation updated and validated

**For developers**: [Key migration/usage notes]
```

This process ensures both the quick reference and comprehensive offline SDK documentation remain accurate, up-to-date, and useful for development work even when internet access is limited or when quick reference is needed during coding sessions.
