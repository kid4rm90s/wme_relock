# Waze Map Editor JavaScript SDK - Quick Reference

**Version:** v2.309-6-g4ee87f28de  
**Updated:** August 21, 2025

> **📚 For comprehensive documentation, see:** [`WME_SDK_COMPLETE_OFFLINE_REFERENCE.md`](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md)  
> **🌐 Official documentation:** https://www.waze.com/editor/sdk/

## Overview
The WME JavaScript SDK provides a TypeScript-based API for developing extensions and scripts for the Waze Map Editor. This document provides essential setup and usage information.

**📋 Complete SDK Coverage Available:**
- **35+ Classes** - See [Core Classes](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#core-classes) & [Data Model Classes](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#data-model-classes)
- **60+ Interfaces** - See [Interfaces](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#interfaces)
- **70+ Type Aliases** - See [Type Aliases](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#type-aliases)
- **15+ Constants** - See [Constants & Variables](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#constants--variables)

## Quick Setup Guide

### 1. SDK Initialization
```javascript
// Wait for SDK to be initialized
window.SDK_INITIALIZED.then(initScript);

function initScript() {
  // Initialize the SDK with your script id and script name
  const sdk = window.getWmeSdk({
    scriptId: 'my-script-id',
    scriptName: 'My Script Name'
  });
  
  // Your script logic here
  console.log('SDK Version:', sdk.getSDKVersion());
}
```

### 2. TypeScript Support
Install type definitions for TypeScript projects:
```bash
npm install --save-dev https://web-assets.waze.com/wme_sdk_docs/production/latest/wme-sdk-typings.tgz
```

```typescript
import { KeyboardShortcut, WmeSDK } from "wme-sdk-typings";

const sdk: WmeSDK = window.getWmeSdk({
  scriptId: "test",
  scriptName: "test"
});
```

## Essential SDK Modules

The SDK provides 9 main modules for different functionality:

| Module | Purpose | Complete Reference |
|--------|---------|-------------------|
| **DataModel** | Access map data (segments, venues, etc.) | [Data Model Classes](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#data-model-classes) |
| **Editing** | Edit operations and transactions | [Core Classes - Editing](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#editing-class) |
| **Map** | Map interactions and custom features | [Core Classes - Map](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#map-class) |
| **Events** | Event system and subscriptions | [UI Classes - SdkEventBus](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#sdkeventbus-class) |
| **Sidebar** | Register UI tabs | [UI Classes - Sidebar](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#sidebar-class) |
| **Settings** | User preferences | [UI Classes - Settings](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#settings-class) |
| **Shortcuts** | Keyboard shortcuts | [UI Classes - Shortcuts](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#shortcuts-class) |
| **LayerSwitcher** | Custom map layers | [UI Classes - LayerSwitcher](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#layerswitcher-class) |
| **State** | Application state access | [UI Classes - WmeState](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#wmestate-class) |

## Common Usage Examples

### Basic Data Access
```javascript
// Get current SDK version and info
const sdk = window.getWmeSdk({ scriptId: 'my-script', scriptName: 'My Script' });
console.log('SDK Version:', sdk.getSDKVersion());
console.log('WME Version:', sdk.getWMEVersion());

// Access map data
const segments = sdk.DataModel.Segments.getAll();
const venues = sdk.DataModel.Venues.getAll();
const selectedFeatures = sdk.Editing.getSelectedFeatures();
```

### Event Handling
```javascript
// Listen for WME ready event
sdk.Events.once({ eventName: "wme-ready" }).then(() => {
  console.log("WME is ready!");
});

// Listen for selection changes
sdk.Events.on({
  eventName: "wme-selection-changed",
  eventHandler: (event) => {
    console.log("Selection changed:", event);
  }
});
```

### UI Integration
```javascript
// Register sidebar tab
sdk.Sidebar.registerScriptTab({
  tabLabel: "My Script",
  tabPane: document.createElement('div')
}).then(({ tabLabel, tabPane }) => {
  tabPane.innerHTML = '<h3>My Script UI</h3>';
});

// Add keyboard shortcut
sdk.Shortcuts.createShortcut({
  shortcutId: "my-shortcut",
  shortcutKeys: "A+s",
  callback: () => alert("Shortcut pressed!")
});
```

**📖 For detailed examples and complete API reference:** [Complete API Reference](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#complete-api-reference)

## Essential Events

### Key Global Events
```javascript
// WME lifecycle events
sdk.Events.once({ eventName: "wme-ready" });
sdk.Events.on({ eventName: "wme-map-data-loaded", eventHandler: handler });
sdk.Events.on({ eventName: "wme-selection-changed", eventHandler: handler });

// Map interaction events  
sdk.Events.on({ eventName: "wme-map-move-end", eventHandler: handler });
sdk.Events.on({ eventName: "wme-map-zoom-changed", eventHandler: handler });
```

### Data Model Events
```javascript
// Enable tracking for specific data models
sdk.Events.trackDataModelEvents({ dataModelName: "segments" });
sdk.Events.trackDataModelEvents({ dataModelName: "venues" });

// Listen for data changes
sdk.Events.on({ eventName: "wme-data-model-objects-added", eventHandler: handler });
sdk.Events.on({ eventName: "wme-data-model-objects-changed", eventHandler: handler });
```

**📋 Complete Events Reference:** [Events Reference](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#complete-api-reference)

## Error Handling

```javascript
try {
  const segment = await sdk.DataModel.Segments.getById({ segmentId: 999999 });
} catch (error) {
  if (error instanceof sdk.Errors.DataModelNotFoundError) {
    console.log("Segment not found");
  } else if (error instanceof sdk.Errors.InvalidParametersError) {
    console.log("Invalid parameters");
  }
}
```

**🔧 Complete Error Classes:** [Error Classes](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#error-handling)

## Troubleshooting

### SDK Initialization Issues

**Common Problem:** `Cannot read properties of undefined (reading 'then')`

**Solutions:**
1. **Check @run-at setting** - Should be set after `DOMContentLoaded`
2. **Using @grant** - Add `// @grant unsafeWindow` and use `unsafeWindow` instead of `window`

```javascript
// If using @grant, use unsafeWindow
unsafeWindow.SDK_INITIALIZED.then(initScript);

// Wrap in DOMContentLoaded if needed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.SDK_INITIALIZED.then(initScript);
  });
} else {
  window.SDK_INITIALIZED.then(initScript);
}
```

## Best Practices

1. **Error Handling**
```javascript
try {
  const segments = await sdk.DataModel.Segments.getAll();
} catch (error) {
  if (error instanceof sdk.Errors.InvalidStateError) {
    console.log("WME not ready");
  }
}
```

2. **Event Cleanup**
```javascript
const handlers = [];
handlers.push(sdk.Events.on({ eventName: "wme-map-move", eventHandler: handler }));
// Cleanup when done: handlers.forEach(h => h.remove());
```

3. **Batch Operations**
```javascript
// Prefer batch access
const segments = sdk.DataModel.Segments.getAll();
// Instead of multiple individual calls
```

## Quick References

### Data Access
- **Segments:** [Segments Class](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#segments-class)
- **Venues:** [Venues Class](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#venues-class)
- **Junctions:** [Junctions Class](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#junctions-class)
- **All Classes:** [Data Model Classes](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#data-model-classes)

### UI Components
- **Sidebar:** [Sidebar Class](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#sidebar-class)
- **Events:** [SdkEventBus Class](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#sdkeventbus-class)
- **Settings:** [Settings Class](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#settings-class)

### Type Definitions
- **Interfaces:** [Complete Interfaces](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#interfaces)
- **Type Aliases:** [Complete Types](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#type-aliases)
- **Constants:** [Constants & Variables](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md#constants--variables)

---

**📚 For comprehensive documentation:** [`WME_SDK_COMPLETE_OFFLINE_REFERENCE.md`](./WME_SDK_COMPLETE_OFFLINE_REFERENCE.md)  
**🌐 Official documentation:** https://www.waze.com/editor/sdk/
