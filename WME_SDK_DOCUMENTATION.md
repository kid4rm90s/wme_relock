# Waze Map Editor JavaScript SDK Documentation

## Overview
The Waze Map Editor (WME) JavaScript SDK (current version: v2.305-13-g1b119bf951) provides a powerful interface for executing community userscripts within the WME environment. This SDK allows scripts to query the WME data model, interact with the map, read application settings, apply changes to features, register to events, and much more.

## Key Features
- **Powerful Functionality**: Direct access to WME capabilities through JavaScript
- **Easy Integration**: Intuitive API design for quick implementation
- **Comprehensive Type Support**: Full TypeScript definitions available
- **Well-Documented**: Extensive documentation and examples
- **Community Support**: Active community for assistance and discussions

## Installation and Setup

### TypeScript Support
TypeScript type definitions for the SDK are available and can be installed with npm:

```bash
npm install --save-dev https://web-assets.waze.com/wme_sdk_docs/production/latest/wme-sdk-typings.tgz
```

After installation, you can import SDK types:

```typescript
import { KeyboardShortcut, WmeSDK } from "wme-sdk-typings";

if (!window.getWmeSdk) {
  throw new Error("SDK not available");
}

const sdk: WmeSDK = window.getWmeSdk({ scriptId: "test", scriptName: "test" });
```

## Getting Started

### SDK Initialization
```javascript
// Wait for SDK initialization
window.SDK_INITIALIZED.then(initScript);

function initScript() {
  // Initialize the SDK with your script ID and name
  const wmeSDK = getWmeSdk({
    scriptId: "your-userscript-id",
    scriptName: "Script Display Name"
  });

  // Your code here...
}
```

### TypeScript Support
TypeScript definitions are available. Install them using:
```bash
npm install --save-dev https://web-assets.waze.com/wme_sdk_docs/production/latest/wme-sdk-typings.tgz
```

Usage with TypeScript:
```typescript
import { KeyboardShortcut, WmeSDK } from "wme-sdk-typings";

if (!window.getWmeSdk) {
  throw new Error("SDK not available");
}

const sdk: WmeSDK = window.getWmeSdk({ 
  scriptId: "test", 
  scriptName: "test" 
});
```

## Core Modules

### DataModel
Access and manipulate WME's underlying data structures:

```javascript
// Get segment by ID
const segment = sdk.DataModel.Segments.getById({ segmentId: 123 });

// Get all venues
const venues = sdk.DataModel.Venues.getAll();

// Add a new venue
await sdk.DataModel.Venues.addVenue({
  category: "PARKING_LOT",
  geometry: {/* GeoJSON geometry */}
});

// Get top country
const topCountry = sdk.DataModel.Countries.getTopCountry();
```

### Editing
Perform editing operations:

```javascript
// Save changes
await sdk.Editing.save();

// Get selected features
const selected = sdk.Editing.getSelectedFeatures();

// Select specific features
sdk.Editing.setSelectedModels([{
  model: segment,
  cause: 'select-segment'
}]);
```

### Map
Interact with the map display:

```javascript
// Get current center
const center = sdk.Map.getMapCenter();

// Set zoom level
sdk.Map.setZoomLevel(4);

// Add custom layer
sdk.Map.addLayer({
  name: "my_layer",
  style: {
    strokeColor: "#ff0000",
    strokeWidth: 3
  }
});

// Add features to layer
sdk.Map.addFeaturesToLayer({
  layerName: "my_layer",
  features: [{
    type: "Feature",
    geometry: {/* GeoJSON geometry */},
    properties: {/* Custom properties */}
  }]
});
```

### Events
Handle WME events:

```javascript
// Single event handler
sdk.Events.once({ 
  eventName: "wme-ready" 
}).then(() => {
  console.log("WME is ready!");
});

// Continuous event handlers
sdk.Events.on({
  eventName: "wme-map-move",
  eventHandler: () => {
    console.log("Map moved");
  }
});

sdk.Events.on({
  eventName: "wme-selection-changed",
  eventHandler: () => {
    const selected = sdk.Editing.getSelectedFeatures();
    console.log("Selection changed:", selected);
  }
});

// Track data model events
sdk.Events.trackDataModelEvents({ 
  dataModelName: "venues" 
});

sdk.Events.on({
  eventName: "wme-data-model-objects-added",
  eventHandler: ({dataModelName, objectIds}) => {
    console.log(`New objects added to ${dataModelName}:`, objectIds);
  }
});
```

## Interface References

### Segment
The Segment interface represents a road segment in the WME:

```typescript
interface Segment {
    id: number;
    geometry: LineString;
    roadType: RoadTypeId;
    length: number;
    isAtoB: boolean;
    isBtoA: boolean;
    isTwoWay: boolean;
    lockRank: UserRank;
    fromNodeId: number | null;
    toNodeId: number | null;
    primaryStreetId: number | null;
    alternateStreetIds: number[];
    junctionId: number | null;
    hasHouseNumbers: boolean;
    hasRestrictions: boolean;
    hasClosures: boolean;
    fromLanesInfo: SegmentLanesInfo | null;
    toLanesInfo: SegmentLanesInfo | null;
    // Additional properties...
}
```

### Turn
The Turn interface represents a turn between segments:

```typescript
interface Turn {
    id: string;
    fromSegmentId: number;
    toSegmentId: number;
    fromSegmentFwd: boolean;
    toSegmentFwd: boolean;
    isAllowed: boolean;
    isUTurn: boolean;
    lanes: TurnLanes | null;
    restrictions: TurnRestriction[];
    instructionOpCode: InstructionOpCode | null;
    // Additional properties...
}
```

### Venue
The Venue interface represents a place or point of interest:

```typescript
interface Venue {
    id: number;
    name: string;
    categories: string[];
    geometry: Point;
    address: VenueAddress;
    openingHours: OpeningHour[];
    // Additional properties...
}
```

## Events Reference

### Global Events
| Event Name | Description |
|------------|-------------|
| `wme-initialized` | Fired when WME has initialized the `window.W` global object and UI is rendered |
| `wme-logged-in` | Fired after user info is fetched or user logs in |
| `wme-logged-out` | Fired when user logs out |
| `wme-map-data-loaded` | Fired when map data is fetched from server |
| `wme-ready` | Fired once after initialization, login and data load are complete |
| `wme-selection-changed` | Fired when map selection changes |
| `wme-map-zoom-changed` | Fired when map zoom level changes |
| `wme-map-move` | Fired continuously during map pan |
| `wme-map-move-end` | Fired when map pan completes |
| `wme-save-finished` | Fired after save attempt (success or failure) |
| `wme-user-settings-changed` | Fired when user settings change |
| `wme-feature-editor-opened` | Fired when feature editor opens with new feature |
| `wme-layer-checkbox-toggled` | Fired when custom map layer checkbox is toggled |
| `wme-after-edit` | Fired after any create/edit/delete operation |
| `wme-after-undo` | Fired after undo operation |
| `wme-no-edits` | Fired when no more edits remain to undo/save |

### Data Model Events
| Event Name | Description |
|------------|-------------|
| `wme-data-model-objects-added` | Fired when objects are added to a tracked model |
| `wme-data-model-objects-changed` | Fired when objects in a tracked model are modified |
| `wme-data-model-objects-removed` | Fired when objects are removed from a tracked model |
| `wme-data-model-objects-saved` | Fired when objects in a tracked model are saved |
| `wme-data-model-object-changed-id` | Fired when an object ID changes in a tracked model |
| `wme-data-model-object-state-deleted` | Fired when objects are marked as deleted |

To track data model events:
```javascript
// Start tracking
sdk.Events.trackDataModelEvents({ 
  dataModelName: "venues" 
});

// Stop tracking when done
sdk.Events.stopDataModelEventsTracking({ 
  dataModelName: "venues" 
});
```

### Layer Events
| Event Name | Description |
|------------|-------------|
| `wme-layer-visibility-changed` | Fired when tracked layer visibility changes |
| `wme-layer-feature-clicked` | Fired when feature in tracked layer is clicked |
| `wme-layer-feature-mouse-enter` | Fired when mouse enters tracked layer feature |
| `wme-layer-feature-mouse-leave` | Fired when mouse leaves tracked layer feature |

To track layer events:
```javascript
// Start tracking
sdk.Events.trackLayerEvents({ 
  layerName: "my_custom_layer" 
});

// Stop tracking when done
sdk.Events.stopLayerEventsTracking({ 
  layerName: "my_custom_layer" 
});
```

## Troubleshooting

### SDK Initialization Issues

1. **DOMContentLoaded Timing**
If you get this error:
```javascript
window.SDK_INITIALIZED.then(initScript); 
// Error: "Cannot read properties of undefined (reading 'then')"
```

This usually happens when your code executes before `DOMContentLoaded`. Solutions:

a. Set proper `@run-at` in userscript metadata:
```javascript
// @run-at document-end
```

b. Or wrap initialization in DOMContentLoaded:
```javascript
document.addEventListener("DOMContentLoaded", () => {
  window.SDK_INITIALIZED.then(initScript);
});
```

2. **Tampermonkey @grant Issues**
When using Tampermonkey `@grant`, use `unsafeWindow`:

```javascript
// @grant GM_setClipboard
// @grant unsafeWindow

unsafeWindow.SDK_INITIALIZED.then(initScript); // Works!
```

## Best Practices

1. **Error Handling**
```javascript
try {
  const segments = await sdk.DataModel.Segments.getAll();
} catch (error) {
  if (error instanceof sdk.InvalidStateError) {
    console.error('Invalid state:', error.message);
  } else if (error instanceof sdk.DataModelNotFoundError) {
    console.error('Data model not found:', error.message);
  }
}
```

2. **Event Cleanup**
```javascript
// Store event handlers for cleanup
const handlers = [];

handlers.push(sdk.Events.on({
  eventName: "wme-map-move",
  eventHandler: () => { /* ... */ }
}));

// Cleanup when done
handlers.forEach(handler => handler.remove());
```

3. **Batch Operations**
```javascript
// Prefer
const segments = sdk.DataModel.Segments.getAll();
segments.forEach(segment => {
  // Process segments
});

// Instead of
for (let i = 0; i < ids.length; i++) {
  const segment = sdk.DataModel.Segments.getById(ids[i]);
  // Process segment
}
```

## Working with Complex Geometries

The SDK supports atomic geometry types:
- `LineString` - For road segments
- `Polygon` - For areas
- `Point` - For venues and other POIs

For complex geometries like MultiPolygons, you can use [Turf.js](https://turfjs.org/) to process them:

```javascript
import { flatten } from "@turf/flatten";

// Example with MultiPolygon
const multiPolygonFeature = {
  type: "Feature",
  properties: {
    name: "Complex Area"
  },
  geometry: {
    type: "MultiPolygon",
    coordinates: [
      [[[0,0], [1,0], [1,1], [0,1], [0,0]]],
      [[[2,2], [3,2], [3,3], [2,3], [2,2]]]
    ]
  }
};

const flattened = flatten(multiPolygonFeature);
const featuresToAdd = flattened.features.map((feature, index) => ({
  geometry: feature.geometry,
  id: `complex-geometry-${index}`,
  properties: feature.properties,
  type: feature.type
}));

sdk.Map.addFeaturesToLayer({
  features: featuresToAdd,
  layerName: "complex_geometries"
});

## Migration Guide

If you're migrating from direct WME API usage to the SDK, here are the common translations:

### Global W Variable Usage
| Old API | SDK Method |
|---------|------------|
| `W.map.*` | Methods in `Map` module |
| `W.model.*.getObjectArray()` | `DataModel.*.getAll()` |
| `W.model.*.getObjectById()` | `DataModel.*.getById()` |
| `W.model.getTopCountry()` | `DataModel.Countries.getTopCountry()` |
| `W.selectionManager.getSelectedFeatures()` | `Editing.getSelectedFeatures()` |
| `W.userscripts.state` | `State` module |
| `W.loginManager.user` | `State.userInfo` |

### Events
| Old API | SDK Event |
|---------|-----------|
| `W.map.events` | `wme-map-*` events |
| `W.model.*.on/off` | Use `Events` module |
| `W.selectionManager.events` | `wme-selection-changed` |
| `W.prefs.on("change")` | `wme-user-settings-changed` |

### Common Patterns

1. **Feature Selection**:
```javascript
// Old
W.selectionManager.setSelectedModels([segment]);

// New
sdk.Editing.setSelectedFeatures([{
  model: segment,
  cause: 'script-select'
}]);
```

2. **Map Movement**:
```javascript
// Old
W.map.setCenter(lon, lat);

// New
sdk.Map.setMapCenter({
  lon: longitude,
  lat: latitude
});
```

3. **Data Model Access**:
```javascript
// Old
const segments = W.model.segments.getObjectArray();

// New
const segments = sdk.DataModel.Segments.getAll();
```

4. **User Settings**:
```javascript
// Old
const isImperial = W.prefs.get("isImperial");

// New
const { isImperial } = sdk.Settings.getUserSettings();
```
| `wme-data-model-objects-added` | Objects added to tracked model |
| `wme-data-model-objects-changed` | Objects in tracked model changed | 
| `wme-data-model-objects-removed` | Objects removed from tracked model |
| `wme-data-model-objects-saved` | Objects saved to server |

### Layer Events  
| Event Name | Description |
|------------|-------------|
| `wme-layer-visibility-changed` | Layer visibility changed |
| `wme-layer-feature-clicked` | Feature in layer clicked |
| `wme-layer-feature-mouse-enter` | Mouse entered feature in layer |
| `wme-layer-feature-mouse-leave` | Mouse left feature in layer |

## Key Interfaces

### Segment
```typescript
interface Segment {
  id: number;
  geometry: LineString;
  roadType: RoadTypeId; 
  primaryStreetId: number | null;
  alternateStreetIds: number[];
  fromNodeId: number | null;
  toNodeId: number | null;
  length: number;
  isAtoB: boolean;
  isBtoA: boolean;
  isTwoWay: boolean;
  lockRank: UserRank;
  hasHouseNumbers: boolean;
  hasRestrictions: boolean;
  hasClosures: boolean;
  elevationLevel: number | null;
  fwdSpeedLimit: number | null;
  revSpeedLimit: number | null;
  flagAttributes: SegmentFlagAttributes;
  modificationData: ModificationMetadata;
}
```

### Venue
```typescript
interface Venue {
  id: number;
  geometry: Point;
  name: string | null;
  categories: VenueCategoryId[];
  openingHours: OpeningHour[];
  address: VenueAddress;
  modificationData: ModificationMetadata;
}
```

### FeatureStyle
```typescript
interface FeatureStyle {
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
  fillColor?: string;
  fillOpacity?: number;
  label?: string;
  labelColor?: string;
  pointRadius?: number;
  externalGraphic?: string;
  graphicWidth?: number;
  graphicHeight?: number;
  graphicOpacity?: number;
}
```

## Advanced Usage & Best Practices

### Error Handling
The SDK provides custom error classes for better error handling:
```javascript
try {
  const segment = await sdk.DataModel.Segments.getById({ segmentId: 999999 });
} catch (error) {
  if (error instanceof sdk.DataModelNotFoundError) {
    console.log("Segment not found");
  } else if (error instanceof sdk.ValidationError) {
    console.log("Invalid parameters");
  } else {
    console.log("Unknown error:", error);
  }
}
```

### Working with Layers
Custom layer with style rules:
```javascript
sdk.Map.addLayer({
  name: "traffic_layer",
  style: {
    rules: [
      {
        predicate: (feature) => feature.properties.traffic > 0.8,
        style: {
          strokeColor: "#ff0000",
          strokeWidth: 4
        }
      },
      {
        predicate: (feature) => feature.properties.traffic > 0.5,
        style: {
          strokeColor: "#ffaa00",
          strokeWidth: 3
        }
      }
    ],
    defaultStyle: {
      strokeColor: "#00ff00",
      strokeWidth: 2
    }
  }
});
```

### Custom Keyboard Shortcuts
```javascript
sdk.Shortcuts.createShortcut({
  shortcutId: "my-shortcut",
  shortcutKeys: "Alt+L",
  description: "Custom action shortcut",
  callback: () => {
    // Your shortcut action here
  }
});
```

### Sidebar Integration
```javascript
sdk.Sidebar.registerScriptTab({
  tabLabel: "My Script",
  tabPane: `<div id="my-script-tab">
    <h3>My Script Controls</h3>
    <button onclick="myScriptAction()">Execute</button>
  </div>`
}).then(() => {
  // Tab is ready and in the DOM
  console.log("Script tab ready");
});
```

### Complex Geometries
For complex geometries (MultiLineString, MultiPolygon, etc.), use [Turf.js](https://turfjs.org/) to break them into atomic geometries:

```javascript
import { flatten } from "@turf/flatten";

const multiPolygonFeature = {
  type: "Feature",
  properties: { name: "test" },
  geometry: {
    type: "MultiPolygon",
    coordinates: [/* ... */]
  }
};

const flattened = flatten(multiPolygonFeature);
const features = flattened.features.map((f, i) => ({
  geometry: f.geometry,
  id: `complex-${i}`,
  properties: f.properties,
  type: f.type
}));

sdk.Map.addFeaturesToLayer({
  features,
  layerName: "my_layer"
});
```

## Troubleshooting

### SDK Initialization Issues
1. Script timing: Ensure your code runs after DOMContentLoaded:
```javascript
document.addEventListener("DOMContentLoaded", () => {
  window.SDK_INITIALIZED.then(initScript);
});
```

2. Tampermonkey @grant issues: When using @grant, use unsafeWindow:
```javascript
// @grant GM_setClipboard
// @grant unsafeWindow

unsafeWindow.SDK_INITIALIZED.then(initScript);
```

### Common Pitfalls
1. Always check for feature existence before operations:
```javascript
const segment = sdk.DataModel.Segments.getById({ segmentId: 123 });
if (!segment) {
  console.error("Segment not found");
  return;
}
```

2. Use proper error handling for asynchronous operations:
```javascript
try {
  await sdk.Editing.save();
  console.log("Changes saved successfully");
} catch (error) {
  console.error("Failed to save changes:", error);
}
```

3. Clean up event listeners when they're no longer needed:
```javascript
const subscription = sdk.Events.on({
  eventName: "wme-map-move",
  eventHandler: () => { /* ... */ }
});

// Later when done:
subscription.remove();
```

## Support Resources
- Visit the [Waze Scripters Hall](https://www.waze.com/forum/viewforum.php?f=1782)
- Contact paszucki@google.com to join WME Scripters + Dev chat
- [TypeScript Definitions](https://web-assets.waze.com/wme_sdk_docs/production/latest/wme-sdk-typings.tgz)
- [Turf.js Documentation](https://turfjs.org/) for complex geometry operations
