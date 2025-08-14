# Copilot Instructions for WME LevelReset

## Requirement: Use Waze Map Editor JavaScript SDK v2.305-13-g1b119bf951

This project must strictly adhere to the [Waze Map Editor JavaScript SDK](https://www.waze.com/editor/sdk/index.html) documentation for all interactions with the Waze Map Editor (WME) in the userscript. All changes and suggestions must be aligned with the current version of the SDK documentation.

### Key Points:
- Initialize the SDK in the userscript using the documented method:
  ```js
  window.SDK_INITIALIZED.then(initScript);
  function initScript() {
    const wmeSDK = getWmeSdk({ scriptId: "your-userscript-id", scriptName: "Script Display Name" });
    // Use wmeSDK for all WME interactions
  }
  ```
- Use the official SDK modules for all interactions:
  - `DataModel` - For accessing/manipulating WME's data structures (segments, nodes, venues, etc.)
  - `Editing` - For operations like saving, undoing, and selecting map features
  - `Map` - For map display interactions, centering/zooming, and layer management
  - `Events` - For event handling and tracking data model changes
  - `Settings` - For user settings management
  - `Shortcuts` - For custom keyboard shortcuts
  - `Sidebar` - For UI elements in the WME sidebar

- Register to WME events properly using the Events module (e.g., `wme-ready`, `wme-map-data-loaded`, etc.). Follow the exact event names and payloads as specified in the SDK documentation.

- Never use internal WME objects directly:
  - ❌ `W.model`, `W.map`, `W.controller`  
  - ✅ Use SDK equivalents following the migration guide

- Use proper SDK error handling:
  ```js
  try {
    const segment = await sdk.DataModel.Segments.getById({ segmentId: 123 });
  } catch (error) {
    if (error instanceof sdk.DataModelNotFoundError) {
      console.log("Segment not found");
    }
  }
  ```

- For Tampermonkey scripts:
  - Use `@grant none`, or
  - Use `unsafeWindow.SDK_INITIALIZED` with other grants

- Complex Geometries:
  - Use atomic geometry types: `LineString`, `Point`, `Polygon`
  - For `MultiPolygon` or `MultiLineString`, flatten using Turf.js

Refer to:
1. Local SDK documentation in `WME_SDK_DOCUMENTATION.md`
2. [Online SDK Documentation](https://www.waze.com/editor/sdk/modules/index.SDK.html) - Use `#read_website` with depth=100 to access the latest online SDK documentation when needed

When working on changes:
- Always verify code changes against the current SDK documentation
- Use `#read_website` with depth=100 when you need to check the latest online SDK documentation
- Ensure all implementations align with both local and online documentation
- Follow the exact interfaces and types as defined in the SDK
