# Waze Map Editor JavaScript SDK Documentation

> **Note:** This documentation was generated based on the official online documentation at https://www.waze.com/editor/sdk/

## Overview
The Waze Map Editor (WME) JavaScript SDK (current version: v2.305-13-g1b119bf951) provides a seamless way to execute community userscripts over the WME. Using the SDK allows scripts to query the WME data model, interact with the map, read application settings, apply changes to features, register to events and more.

## Key Features
- **Powerful Functionality**: Access capabilities of the WME directly from your JavaScript code
- **Easy Integration**: Get up and running quickly with our intuitive API
- **Well-Documented**: Comprehensive documentation and examples to help you every step of the way
- **Community Support**: Join our active community for help and discussions

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
The following example shows how to initialize the SDK in your script:

```javascript
// Wait for SDK to be initialized
window.SDK_INITIALIZED.then(initScript);

function initScript() {
  // Initialize the SDK with your script id and script name
  const wmeSDK = getWmeSdk({
    scriptId: "your-userscript-id",
    scriptName: "Script Display Name"
  });
  
  // Start using the SDK
  const mapCenter = wmeSDK.Map.getMapCenter();
  const topCountry = wmeSDK.DataModel.Countries.getTopCountry();
  
  // Query the WME data model
  const mySegment = wmeSDK.DataModel.Segments.getById({segmentId: 123});
  if (mySegment.isAtoB) {
    // do something
  }
  
  // Add new features
  wmeSDK.DataModel.Venues.addVenue({category, geometry});
  
  // Save edits
  wmeSDK.Editing.save().then(() => {
    // edits saved
  });
  
  // Register to events
  wmeSDK.Events.once({
    eventName: "wme-ready"
  }).then(() => { ... });
  
  wmeSDK.Events.on({
    eventName: "wme-map-move",
    eventHandler: () => { ... }
  });
  
  wmeSDK.Events.on({
    eventName: "wme-map-data-loaded",
    eventHandler: () => { ... }
  });
  
  wmeSDK.Events.on({
    eventName: "wme-selection-changed",
    eventHandler: () => { ... }
  });
}
```

### TypeScript Support
TypeScript type definitions for the SDK are available [here](https://web-assets.waze.com/wme_sdk_docs/production/latest/wme-sdk-typings.tgz).

You can install them with npm:
```bash
npm install --save-dev https://web-assets.waze.com/wme_sdk_docs/production/latest/wme-sdk-typings.tgz
```

After that, you can import SDK types from the package:
```typescript
import { KeyboardShortcut, WmeSDK } from "wme-sdk-typings";

if (!window.getWmeSdk) {
  throw new Error("SDK not available");
}

const sdk: WmeSDK = window.getWmeSdk({
  scriptId: "test",
  scriptName: "test"
});

const shortcut: KeyboardShortcut = {
  callback: () => {
    console.log("Hello world!");
  },
  description: "test shortcut",
  shortcutId: "test-shortcut",
  shortcutKeys: "A+l",
};

sdk.Shortcuts.createShortcut(shortcut);
```

## SDK Structure

The SDK is split into the following modules according to functionality:

- **DataModel**: Access and manipulate the WME's underlying data structures, including segments, nodes, venues, and more.
- **Editing**: Perform various editing operations, such as saving, undoing, and selecting map features.
- **Errors**: A set of custom Error classes which can be used to manage errors that may occur during script execution.
- **LayerSwitcher**: Add or remove custom Map layers checkboxes.
- **Map**: Interact with the map display, including centering/zooming, retrieving map-related information and adding map layers.
- **Settings**: Manage user settings and preferences within the WME.
- **Shortcuts**: Create and manage custom keyboard shortcuts for improved efficiency.
- **Sidebar**: Register & create a dedicated area in the WME sidebar for script UI elements.
- **State**: Access and read the internal state of WME, along with the information about the current logged-in user.

## Core Modules

### DataModel
Access and manipulate WME's underlying data structures, including segments, nodes, venues, and more.

#### Segments
```javascript
// Get segment by ID
const segment = sdk.DataModel.Segments.getById({ segmentId: 123 });

// Get all segments
const segments = sdk.DataModel.Segments.getAll();

// Add new segment
await sdk.DataModel.Segments.addSegment({
  geometry: {/* LineString geometry */},
  roadType: 1, // Street
  fromNodeId: null,
  toNodeId: null
});

// Update segment properties
await sdk.DataModel.Segments.updateSegment({
  segmentId: 123,
  roadType: 2,
  isAtoB: true,
  isBtoA: false
});

// Delete segment
await sdk.DataModel.Segments.deleteSegment({ segmentId: 123 });

// Merge segments
await sdk.DataModel.Segments.mergeSegments({
  segmentIds: [123, 456]
});

// Create roundabout
await sdk.DataModel.Segments.createRoundabout({
  segmentIds: [123, 456, 789]
});

// Add alternate street
await sdk.DataModel.Segments.addAlternateStreet({
  segmentId: 123,
  streetId: 456
});

// Update address
await sdk.DataModel.Segments.updateAddress({
  segmentId: 123,
  address: {/* address object */}
});
```

#### Venues
```javascript
// Get venue by ID
const venue = sdk.DataModel.Venues.getById({ venueId: 123 });

// Get all venues
const venues = sdk.DataModel.Venues.getAll();

// Add new venue
await sdk.DataModel.Venues.addVenue({
  category: "GAS_STATION",
  geometry: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  name: "My Gas Station",
  address: {/* venue address object */}
});

// Update venue
await sdk.DataModel.Venues.updateVenue({
  venueId: 123,
  name: "Updated Name",
  categories: ["GAS_STATION", "CONVENIENCE_STORE"]
});

// Update venue address
await sdk.DataModel.Venues.updateAddress({
  venueId: 123,
  address: {/* address object */}
});

// Get venue categories
const categories = sdk.DataModel.Venues.getVenueCategories();

// Get category brands
const brands = sdk.DataModel.Venues.getCategoryBrands({ category: "GAS_STATION" });
```

#### Countries
```javascript
// Get top country
const topCountry = sdk.DataModel.Countries.getTopCountry();

// Get country by ID
const country = sdk.DataModel.Countries.getById({ countryId: 123 });

// Get all countries
const countries = sdk.DataModel.Countries.getAll();
```

#### States
```javascript
// Get top state
const topState = sdk.DataModel.States.getTopState();

// Get state by ID
const state = sdk.DataModel.States.getById({ stateId: 123 });

// Get all states
const states = sdk.DataModel.States.getAll();
```

#### Cities
```javascript
// Get city
const city = sdk.DataModel.Cities.getCity({
  name: "New York",
  countryId: 1,
  stateId: 1
});

// Add city
await sdk.DataModel.Cities.addCity({
  name: "New City",
  countryId: 1,
  stateId: 1
});
```

#### Streets
```javascript
// Get street
const street = sdk.DataModel.Streets.getStreet({
  name: "Main Street",
  cityId: 123
});

// Add street
await sdk.DataModel.Streets.addStreet({
  name: "New Street",
  cityId: 123
});
```

#### Turns
```javascript
// Get turn information
const turns = sdk.DataModel.Turns.getTurns({
  fromSegmentId: 123,
  toSegmentId: 456
});

// Get turn graph data
const turnGraph = sdk.DataModel.Turns.getTurnGraph();
```

#### Users
```javascript
// Get user profile link
const profileLink = sdk.DataModel.Users.getUserProfileLink({
  userId: 123
});
```

#### General Data Model Methods
```javascript
// Refresh map data
await sdk.DataModel.refreshData();
```

### Editing
Perform various editing operations, such as saving, undoing, and selecting map features.

```javascript
// Save changes
await sdk.Editing.save();

// Get selected features
const selectedFeatures = sdk.Editing.getSelectedFeatures();

// Set selected features
sdk.Editing.setSelectedFeatures([{
  model: segment,
  cause: 'script-select'
}]);

// Clear selection
sdk.Editing.clearSelection();
```

### Map
Interact with the map display, including centering/zooming, retrieving map-related information and adding map layers.

```javascript
// Get current map center
const center = sdk.Map.getMapCenter(); // Returns { lon: number, lat: number }

// Set map center
sdk.Map.setMapCenter({
  lon: -73.9857,
  lat: 40.7484
});

// Get current zoom level
const zoomLevel = sdk.Map.getZoomLevel();

// Set zoom level
sdk.Map.setZoomLevel(15);

// Add custom layer
sdk.Map.addLayer({
  name: "my_custom_layer",
  style: {
    strokeColor: "#ff0000",
    strokeWidth: 3,
    strokeOpacity: 0.8,
    fillColor: "#ffff00",
    fillOpacity: 0.3
  }
});

// Remove layer
sdk.Map.removeLayer({ layerName: "my_custom_layer" });

// Add features to layer
sdk.Map.addFeaturesToLayer({
  layerName: "my_custom_layer",
  features: [{
    type: "Feature",
    id: "feature1",
    geometry: {
      type: "Point",
      coordinates: [-73.9857, 40.7484]
    },
    properties: {
      name: "Feature 1"
    }
  }]
});

// Remove features from layer
sdk.Map.removeFeaturesFromLayer({
  layerName: "my_custom_layer",
  featureIds: ["feature1"]
});

// Drawing methods
sdk.Map.drawPoint({
  callback: (point) => {
    console.log("Point drawn:", point);
  }
});

sdk.Map.drawLineString({
  callback: (lineString) => {
    console.log("LineString drawn:", lineString);
  }
});

sdk.Map.drawPolygon({
  callback: (polygon) => {
    console.log("Polygon drawn:", polygon);
  }
});
```

### Settings
Manage user settings and preferences within the WME.

```javascript
// Get user settings
const userSettings = sdk.Settings.getUserSettings();
console.log("Imperial units:", userSettings.isImperial);
console.log("Left-hand traffic:", userSettings.isLeftHandTraffic);

// Set user settings
await sdk.Settings.setUserSettings({
  isImperial: false
});

// Get locale
const locale = sdk.Settings.getLocale();

// Get region code
const regionCode = sdk.Settings.getRegionCode();
```

### Shortcuts
Create and manage custom keyboard shortcuts for improved efficiency.

```javascript
// Create shortcut
sdk.Shortcuts.createShortcut({
  shortcutId: "my-shortcut",
  shortcutKeys: "Alt+Shift+M",
  description: "My custom shortcut",
  callback: () => {
    console.log("Shortcut activated!");
  }
});

// Remove shortcut
sdk.Shortcuts.removeShortcut({ shortcutId: "my-shortcut" });

// Get all shortcuts
const shortcuts = sdk.Shortcuts.getShortcuts();
```

### Sidebar
Register & create a dedicated area in the WME sidebar for script UI elements.

```javascript
// Register script tab
sdk.Sidebar.registerScriptTab({
  tabLabel: "My Script",
  tabPane: `
    <div id="my-script-panel">
      <h3>My Script Controls</h3>
      <button id="my-button">Click Me</button>
      <div id="my-output"></div>
    </div>
  `
}).then(({ tabLabel, tabPane }) => {
  // Tab elements are now available in DOM
  console.log("Script tab registered successfully");
  
  // Add event listeners
  document.getElementById("my-button").addEventListener("click", () => {
    document.getElementById("my-output").innerHTML = "Button clicked!";
  });
});
```

### LayerSwitcher
Add or remove custom Map layers checkboxes.

```javascript
// Add layer checkbox
sdk.LayerSwitcher.addLayerCheckbox({
  name: "My Custom Layer",
  layerName: "my_custom_layer",
  checked: true
});

// Remove layer checkbox
sdk.LayerSwitcher.removeLayerCheckbox({
  name: "My Custom Layer"
});
```

### State
Access and read the internal state of WME, along with the information about the current logged-in user.

```javascript
// Get user info
const userInfo = sdk.State.userInfo;
if (userInfo) {
  console.log("User ID:", userInfo.id);
  console.log("Username:", userInfo.userName);
  console.log("User rank:", userInfo.rank);
} else {
  console.log("User not logged in");
}

// Get WME state information
const wmeState = sdk.State.getWmeState();
```

### Errors
A set of custom Error classes which can be used to manage errors that may occur during script execution.

```javascript
try {
  const segment = await sdk.DataModel.Segments.getById({ segmentId: 999999 });
} catch (error) {
  if (error instanceof sdk.DataModelNotFoundError) {
    console.log("Segment not found");
  } else if (error instanceof sdk.ValidationError) {
    console.log("Invalid parameters:", error.message);
  } else if (error instanceof sdk.InvalidStateError) {
    console.log("Invalid WME state:", error.message);
  } else {
    console.log("Unknown error:", error);
  }
}
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
  elevationLevel: number | null;
  fwdSpeedLimit: number | null;
  revSpeedLimit: number | null;
  flagAttributes: SegmentFlagAttributes;
  modificationData: ModificationMetadata;
}
```

### Venue
The Venue interface represents a place or point of interest:

```typescript
interface Venue {
  id: number;
  name: string | null;
  categories: VenueCategoryId[];
  geometry: Point;
  address: VenueAddress;
  openingHours: OpeningHour[];
  modificationData: ModificationMetadata;
  lockRank: UserRank;
  permalink: string | null;
  description: string | null;
  phone: string | null;
  url: string | null;
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
}
```

### Node
The Node interface represents a junction or connection point:

```typescript
interface Node {
  id: number;
  geometry: Point;
  segmentIds: number[];
  restrictions: NodeRestriction[];
}
```

### Country
The Country interface represents a country:

```typescript
interface Country {
  id: number;
  name: string;
  abbr: string;
  isLeftHandTraffic: boolean;
}
```

### State
The State interface represents a state/province:

```typescript
interface State {
  id: number;
  name: string;
  abbr: string;
  countryId: number;
}
```

### City
The City interface represents a city:

```typescript
interface City {
  id: number;
  name: string;
  stateId: number;
  countryId: number;
}
```

### Street
The Street interface represents a street name:

```typescript
interface Street {
  id: number;
  name: string;
  cityId: number | null;
  isEmpty: boolean;
}
```

### FeatureStyle
Style configuration for map features:

```typescript
interface FeatureStyle {
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWidth?: number;
  strokeDasharray?: string;
  fillColor?: string;
  fillOpacity?: number;
  label?: string;
  labelColor?: string;
  labelOutlineColor?: string;
  labelOutlineWidth?: number;
  pointRadius?: number;
  externalGraphic?: string;
  graphicWidth?: number;
  graphicHeight?: number;
  graphicOpacity?: number;
}
```

### LayerStyle
Style configuration for layers with conditional styling:

```typescript
interface LayerStyle {
  defaultStyle?: FeatureStyle;
  rules?: Array<{
    predicate: (feature: any) => boolean;
    style: FeatureStyle;
  }>;
}
```

### KeyboardShortcut
Configuration for keyboard shortcuts:

```typescript
interface KeyboardShortcut {
  shortcutId: string;
  shortcutKeys: string;
  description: string;
  callback: () => void;
}
```

### UserSettings
WME user settings:

```typescript
interface UserSettings {
  isImperial: boolean;
  isLeftHandTraffic: boolean;
  // Additional settings...
}
```

### UserInfo
Information about the current logged-in user:

```typescript
interface UserInfo {
  id: number;
  userName: string;
  rank: UserRank;
  editCount: number;
  // Additional user properties...
}
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

The SDK adds a set of custom events triggered by the WME at various points during its lifecycle and user interactions. These events enable scripts to react to specific actions and states within the WME application.

There are multiple types of events: global events, data model events & layer events.

### Global Events
| Event Name | Description |
|------------|-------------|
| `wme-initialized` | Dispatched when WME has initialized the window.W global object and its internals, and the UI has been rendered. Note that at this point, map data has not yet been fetched. |
| `wme-logged-in` | Dispatched after the wme-initialized event when WME fetches the user info of the currently logged-in user, or after the user logs in using the login form. |
| `wme-logged-out` | Dispatched when the user logs out of WME. |
| `wme-map-data-loaded` | Dispatched after the wme-initialized event whenever WME fetches map data from the server (e.g. when the user scrolls the map, changes the zoom level, or presses the refresh button). This is similar to the mergeend event triggered on W.model. |
| `wme-ready` | Dispatched **only once**, after the wme-initialized, wme-logged-in, and wme-map-data-loaded events have been dispatched. |
| `wme-selection-changed` | Dispatched when some entity gets selected or unselected on the map. |
| `wme-feature-editor-opened` | Dispatched when the feature editor is opened in the side panel with a new feature. **Note:** Essentially, this event means the feature editor is ready in the side panel. While at this point you'll usually see the feature editor on the screen, it's not a guarantee. There might be a slight delay before the feature editor is actually visible. |
| `wme-map-zoom-changed` | Dispatched when the map is zoomed in or out. |
| `wme-map-layer-added` | Dispatched when the new layer is added to the map. |
| `wme-map-layer-changed` | Dispatched when a layer on the map changes visibility or name. |
| `wme-map-layer-removed` | Dispatched when a layer is removed from the map. |
| `wme-map-mouse-down` | Dispatched when the mouse button is pressed while the pointer is inside the map. |
| `wme-map-mouse-move` | Dispatched when the mouse is moved over the map. Note that this event is continuously fired when moving the mouse. |
| `wme-map-mouse-up` | Dispatched when the mouse button is released while the pointer is inside the map. |
| `wme-map-move` | Dispatched when the map is panned. Note that this event is continuously fired during pan. |
| `wme-map-move-end` | Dispatched when a map move is complete. |
| `wme-user-settings-changed` | Dispatched when WME user settings have changed. |
| `wme-save-finished` | Dispatched when the save attempt has been done by the user. The event is dispatched for both successful and failed save. The event detail contains a success boolean parameter which is true for the successful save and false otherwise. |
| `wme-layer-checkbox-toggled` | Dispatched when the custom Map layers checkbox, registered by the script, was toggled. The event detail contains the name of the checkbox, and checked parameter which is true if the checkbox became checked and false otherwise. |
| `wme-editing-house-numbers` | [DEPRECATED - Use wme-map-house-number-marker-added instead] Dispatched when the user starts or stops editing house numbers. |
| `wme-map-house-number-marker-added` | Dispatched when the when the user clicks and adds a house number marker to the map. |
| `wme-house-number-added` | Dispatched when a house number is added. |
| `wme-house-number-deleted` | Dispatched when a house number is deleted. |
| `wme-house-number-moved` | Dispatched when a house number is moved. |
| `wme-house-number-updated` | Dispatched when a house number is updated. |
| `wme-after-edit` | Dispatched after user performs an create/edit/delete of an object. |
| `wme-after-redo-clear` | Dispatched after user performs any new edit while being able to redo previous edits. |
| `wme-after-undo` | Dispatched after WME user performs an undo. |
| `wme-no-edits` | Dispatched after WME user performs the last undo or save indicating no edits left to be able to undo or save. |
| `wme-save-mode-changed` | Dispatched when the current state of the save button is changed. The event detail contains a saveMode parameter with current save mode. |
| `wme-update-request-panel-opened` | Dispatched when WME user clicks on the map update request or the map update request map marker. |
| `wme-street-view-panel-visibility-changed` | Dispatched when the street view panel changes its visibility. |
| `wme-street-view-button-activated` | Dispatched when WME user starts dragging the street view button. |
| `wme-street-view-button-deactivated` | Dispatched after WME user stops dragging the street view button. |

Registering to these events is done via the `sdk.Events` module:

```javascript
sdk.Events.once({
  eventName: "wme-ready"
}).then(() => {
  console.log("WME is initialized, user is logged in and map data loaded");
});

sdk.Events.on({
  eventName: "wme-map-data-loaded",
  eventHandler: () => {
    console.log("new data loaded");
  },
});

sdk.Events.on({
  eventName: "wme-map-zoom-changed",
  eventHandler: () => {
    sdk.Map.getZoomLevel();
  },
});

sdk.Events.on({
  eventName: "wme-user-settings-changed",
  eventHandler: () => {
    sdk.Settings.getUserSettings().isImperial;
  },
});
```

### Data Model Events
| Event Name | Description |
|------------|-------------|
| `wme-data-model-objects-added` | Dispatched when objects have been added to a tracked model. |
| `wme-data-model-objects-changed` | Dispatched when the attributes of an object or objects in a tracked model have been changed. |
| `wme-data-model-objects-removed` | Dispatched when objects have been removed from a tracked model. |
| `wme-data-model-objects-saved` | Dispatched when objects in a tracked data model have been saved to the server. |
| `wme-data-model-object-changed-id` | Dispatched when an object ID in a tracked data model have been changed. |
| `wme-data-model-object-state-deleted` | Dispatched when objects have been marked as deleted but are not removed from the tracked data model. |

To listen to model events, they need to be activated first. The activation is done for each model individually via the `sdk.Events` module:

```javascript
sdk.Events.trackDataModelEvents({
  dataModelName: "venues"
});
```

After the events are activated for the model they can be handled in the same way as the global events:

```javascript
sdk.Events.on({
  eventName: "wme-data-model-objects-added",
  eventHandler: ({dataModelName, objectIds}) => { ... },
});
```

Each event will include a payload of the data model name which triggered the event and an array of the object ids affected.

Once model events are not needed anymore they should be deactivated:

```javascript
sdk.Events.stopDataModelEventsTracking({
  dataModelName: "venues"
});
```

### Layer Events
| Event Name | Description |
|------------|-------------|
| `wme-layer-visibility-changed` | Dispatched when a tracked layer visibility has been changed. |
| `wme-layer-feature-clicked` | Dispatched when a feature in a tracked layer has been clicked. |
| `wme-layer-feature-mouse-enter` | Dispatched when the mouse enters a feature in a tracked layer. |
| `wme-layer-feature-mouse-leave` | Dispatched when the mouse leaves a feature in a tracked layer. |

To listen to a layer events they need to be activated first. The activation is done for each layer individually via the `sdk.Events` module:

```javascript
sdk.Events.trackLayerEvents({
  layerName: "my_custom_layer"
});
```

After the events are activated for the layer they can be handled in the same way as the global events:

```javascript
sdk.Events.on({
  eventName: "wme-layer-visibility-changed",
  eventHandler: () => { ... },
});
```

Once layer events are not needed anymore they should be deactivated:

```javascript
sdk.Events.stopLayerEventsTracking({
  layerName: "my_custom_layer"
});
```

## Troubleshooting

### SDK Initialization

Sometimes, when initializing the SDK, you can get the following error:

```javascript
window.SDK_INITIALIZED.then(initScript); 
// <- "Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'then')"
```

There might be a couple of reasons why you are getting it:

1. **Your code may be executed before the DOMContentLoaded event is dispatched**. To make sure that it's not the case, check your [@run-at](https://www.tampermonkey.net/documentation.php#meta:run_at) setting. It should be set to anything that guarantees the script execution after the `DOMContentLoaded` was dispatched. If you are using a `@run-at` setting which injects your code before the `DOMContentLoaded` dispatch, or if your environment does not support `@run-at` or similar setting, you will need to wrap your initialization code as following:

   ```javascript
   document.addEventListener("DOMContentLoaded", () => {
     window.SDK_INITIALIZED.then(initScript); // <- works fine!
   });
   ```

2. **You may be using a `@grant` header**. If you're using Tampermonkey or a similar tool, it allows you to include some useful functions with [@grant](https://www.tampermonkey.net/documentation.php#meta:grant). However, if you add `@grant` with anything other than `none`, it will provide your script with a `window` object, which is different from the one which the host uses. So, in case you want to add a function with `@grant`, make sure you add `// @grant unsafeWindow` to your script and use `unsafeWindow` instead of `window`.

   ```javascript
   ...
   // @grant none
   ...
   window.SDK_INITIALIZED.then(initScript); // <- works fine!
   ```

   ```javascript
   ...
   // @grant GM_setClipboard
   ...
   window.SDK_INITIALIZED.then(initScript); // <- fails with "Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'then')"
   ```

   ```javascript
   ...
   // @grant GM_setClipboard
   // @grant unsafeWindow
   ...
   unsafeWindow.SDK_INITIALIZED.then(initScript); // <- works fine!
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

The SDK allows you to work with atomic geometries: `LineString`, `Polygon`, and `Point`. These are the basic building blocks for representing geographic features.

For more complex geometries, such as MultiLineStrings (a collection of LineStrings), MultiPolygons (a collection of Polygons), or GeometryCollections (a collection of different geometry types), you'll need to process them before using them with the SDK. A good way to do this is with the [Turf.js](https://turfjs.org/) library, which has a [flatten](https://turfjs.org/docs/api/flatten) helper that breaks complex geometries into atomic ones. After installing Turf.js, you can use it like this:

```javascript
import { flatten } from "@turf/flatten";

// Example feature with MultiPolygon geometry
const multiPolygonFeature = {
  type: "Feature",
  properties: {
    foo: "bar",
  },
  geometry: {
    type: "MultiPolygon",
    coordinates: [
      [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
          [0, 0],
        ],
      ],
      [
        [
          [2, 2],
          [3, 2],
          [3, 3],
          [2, 3],
          [2, 2],
        ],
      ],
    ],
  },
};

const flattened = flatten(multiPolygonFeature);
// you can also use flatten(multiPolygonFeature.geometry)

const featuresToAdd = flattened.features.map((feature, index) => ({
  geometry: feature.geometry,
  id: `complex-geometry-${index}`, // generate a unique ID
  properties: feature.properties,
  type: feature.type,
}));

sdk.Map.addFeaturesToLayer({
  features: featuresToAdd,
  layerName: "your_layer_name",
});
```
## Migration Guide

If you're migrating your script from using internal WME methods directly to the new WME SDK, the tables below list commonly used internal methods and their corresponding methods in the SDK.

### Usages of Global W Variable
| Pre-SDK usage | SDK method |
|---------------|------------|
| `W.accelerators` | Use methods in `Shortcuts` module |
| `W.app.getAppRegionCode` | Use `Settings.getRegionCode` |
| `W.Config.venues.categories` \\ `W.Config.venues.subcategories` \\ `W.model.categoryBrands` | `DataModel.Venues` contains methods for getting venue categories as well as category brands |
| `W.Config.user_profile.url` | Use `DataModel.Users.getUserProfileLink` |
| `W.controller.reloadData` | Use `DataModel.refreshData` |
| `W.controller.save` | Use `Editing.save` |
| `W.loginManager.user` | Use `State.userInfo` to get the logged in user information |
| `W.loginManager.isLoggedIn` | `State.userInfo` will be null if a user is not logged in |
| `W.map.*` | The `Map` module contains methods to interact and query with the map, such as center, zoom, adding/removing layers, drawing on the map and more. See the Map module documentation for more information |
| `W.map.events` | The events `wme-map-zoom-changed`, `wme-map-move`&`wme-map-move-end` are triggered by the SDK |
| `W.model.*.on` \\ `W.model.*.off` | Use the `Events` module which allows tracking changes in a data model |
| `W.model.*.getObjectArray` \\ `W.model.*.objects` | Use `DataModel.*.getAll` |
| `W.model.*.getObjectById` | Use `DataModel.*.getById` |
| `W.model.getTopCountry` | Use `DataModel.Countries.getTopCountry` |
| `W.model.getTopState` | Use `DataModel.States.getTopState` |
| `W.model.isImperial` | Use `Settings.getUserSettings().isImperial` |
| `W.model.isLeftHand` | Use `isLeftHandTraffic` attribute on the `Country` SDK interface |
| `W.model.getTurnGraph` | Use methods in `DataModel.Turns` |
| `W.prefs.get` \\ `W.prefs.set` \\ `W.prefs.attributes` | Use `Settings.getUserSettings` \\ `Settings.setUserSettings` |
| `W.prefs.on("change")` | Register to the event `wme-user-settings-changed` triggered by the SDK |
| `W.selectionManager.getSelectedFeatures` \\ `W.selectionManager.setSelectedModels` | The `Editing` module contains methods to get and set selected features. See the Editing module documentation for more information |
| `W.selectionManager.events` | The event `wme-selection-changed` is triggered by the SDK when selection has changed |
| `W.userscripts.state` | Use `State` included on the SDK instance |
| `W.userscripts.registerSidebarTab` | Use `Sidebar.registerScriptTab` |
| `W.userscripts.waitForElementConnected` | Not required as the SDK method `Sidebar.registerScriptTab` returns a `Promise` which resolves when the `tabLabel` & `tabPane` elements are available in the DOM |
| `W.app.on('change:loadingIssueTrackerMapData', callback);` | Use `wme-map-data-loaded` event to determine whether the map data is loaded. |

### Usages of Waze/Action/*
In general, the SDK will provide abstractions over actions and expose methods to update data models via their relevant modules.

| Pre-SDK usage | SDK method |
|---------------|------------|
| `AddAlternateStreet` | Use `DataModel.Segments.addAlternateStreet` |
| `AddLandmark` | Use `DataModel.Venues.addVenue` |
| `AddOrGetCity` | Use `DataModel.Cities.getCity` \\ `DataModel.Cities.addCity` |
| `AddOrGetStreet` | Use `DataModel.Streets.getStreet` \\ `DataModel.Streets.addStreet` |
| `AddSegment` | Use `DataModel.Segments.addSegment` |
| `CreateRoundabout` | Use `DataModel.Segments.createRoundabout` |
| `DeleteSegment` | Use `DataModel.Segments.deleteSegment` |
| `MergeSegments` | Use `DataModel.Segments.mergeSegments` |
| `UpdateFeatureAddress` | Use `DataModel.Segments.updateAddress` \\ `DataModel.Venues.updateAddress` |

### Usages of OpenLayers or OL
| Pre-SDK usage | SDK method |
|---------------|------------|
| `OpenLayers.Control.DrawFeature` | Use `Map.draw*` methods |
| `OpenLayers.Geometry.LineString` \\ `OpenLayers.Geometry.Point` \\ `OpenLayers.Geometry.Polygon` | Use `Map.addFeatureToLayer` to add features or `Map.draw*` to draw |
| `OpenLayers.Layer.Vector` \\ `OpenLayers.Feature.Vector` | Use `Map.addLayer` & `Map.addFeatureToLayer` |
| `OpenLayers.Style` \\ `OpenLayers.StyleMap` \\ `OpenLayers.Rule` | Use `Map.addLayer` with style object |
| `OpenLayers.LonLat` | SDK works with plain JS objects - `{ lon: number; lat: number; }` |

### Usages of I18n
| Pre-SDK usage | SDK method |
|---------------|------------|
| `I18n.currentLocale()` \\ `I18n.locale` | `Settings.getLocale` |

As this SDK is in active development, we will update this guide as more functionality is added. As always, your feedback is encouraged. Please report any issues encountered to help improve the SDK.

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
- Reach out to [paszucki@google.com](mailto:paszucki@google.com) to join the WME Scripters + Dev chat space
- [TypeScript Definitions](https://web-assets.waze.com/wme_sdk_docs/production/latest/wme-sdk-typings.tgz)
- [Turf.js Documentation](https://turfjs.org/) for complex geometry operations

## Disclaimer

This SDK is designed to facilitate integration with the WME for script writers. However, Waze does not guarantee the functionality, accuracy, or reliability of any scripts developed using this SDK. Users are solely responsible for the scripts they create and their performance.
