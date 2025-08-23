# Waze Map Editor JavaScript SDK - Complete Offline Reference

**Version:** v2.309-6-g4ee87f28de  
**Generated:** August 21, 2025  
**Purpose:** Complete offline reference for WME JavaScript SDK

---

## Table of Contents

1. [SDK Overview](#sdk-overview)
2. [Getting Started](#getting-started)
3. [Core Classes](#core-classes)
4. [Data Model Classes](#data-model-classes)
5. [UI & Interaction Classes](#ui--interaction-classes)
6. [Interfaces](#interfaces)
7. [Type Aliases](#type-aliases)
8. [Constants & Variables](#constants--variables)
9. [Complete API Reference](#complete-api-reference)
10. [Migration Guide](#migration-guide)
11. [Best Practices](#best-practices)

---

## SDK Overview

The Waze Map Editor JavaScript SDK provides a comprehensive TypeScript-based API for developing extensions and scripts for the Waze Map Editor. The SDK includes:

- **35+ Classes** for data access and manipulation
- **60+ Interfaces** for type safety and structure
- **70+ Type Aliases** for enums and union types
- **15+ Variables** for constants and configuration

### Architecture

```
WmeSDK (Main Container)
├── DataModel (Data access)
├── Editing (Edit operations)  
├── Map (Map interactions)
├── Events (Event system)
├── Sidebar (UI components)
├── Settings (User preferences)
├── Shortcuts (Keyboard handling)
├── LayerSwitcher (Layer management)
├── State (Application state)
└── Errors (Error handling)
```

---

## Getting Started

### Basic Setup

```javascript
// Get SDK instance
const sdk = await getWmeSdk('your-script-id', 'Your Script Name');

// Access core components
const dataModel = sdk.DataModel;
const map = sdk.Map;
const editing = sdk.Editing;
const events = sdk.Events;
```

### SDK Information Methods

```javascript
// Get version information
const sdkVersion = sdk.getSDKVersion();           // SDK version
const wmeVersion = sdk.getWMEVersion();           // WME frontend version
const backendVersion = await sdk.getWMEBackEndVersion(); // WME backend version

// Environment check
const isBeta = sdk.isBetaEnvironment();           // true if beta environment

// Script information
const scriptId = sdk.getScriptId();               // Your script ID
const scriptName = sdk.getScriptName();           // Your script name
```

---

## Core Classes

### WmeSDK Class

**Description:** Main SDK container class that provides access to all SDK modules.

**Hierarchy:** `SdkModule` → `WmeSDK`

**Properties:**
- `DataModel: DataModel` - Data access and manipulation
- `Editing: Editing` - Edit operations and transactions
- `Events: SdkEventBus` - Event subscription and handling
- `LayerSwitcher: LayerSwitcher` - Map layer management
- `Map: Map` - Map interactions and controls
- `Settings: Settings` - User settings and preferences
- `Shortcuts: Shortcuts` - Keyboard shortcut management
- `Sidebar: Sidebar` - Sidebar tab registration
- `State: WmeState` - Application state access
- `Errors: ErrorClasses` - Error class definitions

**Methods:**
- `getScriptId(): string` - Returns the script ID
- `getScriptName(): string` - Returns the script name
- `getSDKVersion(): string` - Returns current SDK version
- `getWMEBackEndVersion(): Promise<string>` - Returns WME backend version
- `getWMEVersion(): string` - Returns WME frontend version
- `isBetaEnvironment(): boolean` - Checks if running in beta environment

### DataModel Class

**Description:** Provides access to all map data including segments, venues, junctions, etc.

**Key Properties:**
- `BigJunctions: BigJunctions` - Big junction data access
- `Cities: Cities` - City data access
- `Countries: Countries` - Country data access
- `EditSuggestions: EditSuggestions` - Edit suggestion data
- `HouseNumbers: HouseNumbers` - House number data
- `Junctions: Junctions` - Junction data access
- `MajorTrafficEvents: MajorTrafficEvents` - Traffic event data
- `ManagedAreas: ManagedAreas` - Managed area data
- `MapComments: MapComments` - Map comment data
- `MapProblems: MapProblems` - Map problem data
- `MapUpdateRequests: MapUpdateRequests` - Update request data
- `Nodes: Nodes` - Node data access
- `PermanentHazards: PermanentHazards` - Permanent hazard data
- `RestrictedDrivingAreas: RestrictedDrivingAreas` - RDA data
- `RoadClosures: RoadClosures` - Road closure data
- `Segments: Segments` - Segment data access
- `States: States` - State/province data
- `Streets: Streets` - Street data access
- `TurnClosures: TurnClosures` - Turn closure data
- `Turns: Turns` - Turn data access
- `Users: Users` - User data access
- `Venues: Venues` - Venue/place data access

**Key Methods:**
- `subscribe(dataModelName, callback): Subscription` - Subscribe to data changes
- `getObjectById(id): MapObject | null` - Get map object by ID
- `isLoaded(dataModelName): boolean` - Check if data model is loaded

### Map Class

**Description:** Handles map interactions, coordinate transformations, and visual elements.

**Key Methods:**
- `getCenter(): LonLat` - Get map center coordinates
- `setCenter(lonlat: LonLat): void` - Set map center
- `getZoom(): ZoomLevel` - Get current zoom level
- `setZoom(zoom: ZoomLevel): void` - Set zoom level
- `getExtent(): Extent` - Get current map extent
- `getBounds(): Bounds` - Get current map bounds
- `projectFromLonLat(lonlat: LonLat): Pixel` - Convert coordinates to pixels
- `projectToLonLat(pixel: Pixel): LonLat` - Convert pixels to coordinates
- `addFeature(feature: SdkFeature): void` - Add custom feature to map
- `removeFeature(feature: SdkFeature): void` - Remove feature from map
- `clearFeatures(): void` - Remove all custom features
- `on(eventType: string, callback: Function): Subscription` - Subscribe to map events

### Editing Class

**Description:** Manages edit operations and transactions.

**Key Methods:**
- `beginTransaction(): void` - Start edit transaction
- `commitTransaction(): void` - Commit current transaction
- `rollbackTransaction(): void` - Rollback current transaction
- `isTransactionActive(): boolean` - Check if transaction is active
- `save(mode?: SaveMode): Promise<void>` - Save changes to server
- `canSave(): boolean` - Check if changes can be saved
- `hasUnsavedChanges(): boolean` - Check for unsaved changes

---

## Data Model Classes

### Segments Class

**Description:** Access and manipulation of road segments.

**Key Methods:**
- `getByIds(ids: number[]): Segment[]` - Get segments by ID array
- `getObjectById(id: number): Segment | null` - Get single segment by ID
- `getSelected(): Segment[]` - Get currently selected segments
- `getAll(): Segment[]` - Get all loaded segments
- `getInView(): Segment[]` - Get segments in current map view
- `create(geometry: Geometry, options: SegmentOptions): Segment` - Create new segment
- `delete(segment: Segment): void` - Delete segment
- `update(segment: Segment, changes: Partial<Segment>): void` - Update segment
- `split(segment: Segment, point: LonLat): Segment[]` - Split segment at point
- `merge(segments: Segment[]): Segment` - Merge segments
- `getConnectedSegments(segment: Segment): Segment[]` - Get connected segments
- `getRoadType(segment: Segment): RoadType` - Get segment road type
- `setRoadType(segment: Segment, roadType: RoadTypeId): void` - Set road type
- `getDirection(segment: Segment): SegmentDirection` - Get segment direction
- `setDirection(segment: Segment, direction: SegmentDirection): void` - Set direction
- `getPermissions(segment: Segment): SegmentPermission[]` - Get vehicle permissions
- `setPermissions(segment: Segment, permissions: SegmentPermission[]): void` - Set permissions
- `getAddress(segment: Segment): SegmentAddress | null` - Get segment address
- `setAddress(segment: Segment, address: SegmentAddress): void` - Set segment address

### Venues Class

**Description:** Access and manipulation of places/venues.

**Key Methods:**
- `getByIds(ids: number[]): Venue[]` - Get venues by ID array
- `getObjectById(id: number): Venue | null` - Get single venue by ID
- `getSelected(): Venue[]` - Get currently selected venues
- `getAll(): Venue[]` - Get all loaded venues
- `getInView(): Venue[]` - Get venues in current map view
- `create(point: LonLat, options: VenueOptions): Venue` - Create new venue
- `delete(venue: Venue): void` - Delete venue
- `update(venue: Venue, changes: Partial<Venue>): void` - Update venue
- `getName(venue: Venue): string` - Get venue name
- `setName(venue: Venue, name: string): void` - Set venue name
- `getCategories(venue: Venue): VenueCategory[]` - Get venue categories
- `setCategories(venue: Venue, categories: VenueCategoryId[]): void` - Set categories
- `getAddress(venue: Venue): VenueAddress` - Get venue address
- `setAddress(venue: Venue, address: VenueAddress): void` - Set venue address
- `getOpeningHours(venue: Venue): OpeningHour[]` - Get opening hours
- `setOpeningHours(venue: Venue, hours: OpeningHour[]): void` - Set opening hours
- `getPhoneNumber(venue: Venue): string` - Get phone number
- `setPhoneNumber(venue: Venue, phone: string): void` - Set phone number
- `getURL(venue: Venue): string` - Get venue URL
- `setURL(venue: Venue, url: string): void` - Set venue URL
- `getDescription(venue: Venue): string` - Get venue description
- `setDescription(venue: Venue, description: string): void` - Set description
- `getImages(venue: Venue): VenueImage[]` - Get venue images
- `addImage(venue: Venue, image: VenueImage): void` - Add venue image
- `removeImage(venue: Venue, image: VenueImage): void` - Remove venue image

### Junctions Class

**Description:** Access and manipulation of junctions/intersections.

**Key Methods:**
- `getByIds(ids: number[]): Junction[]` - Get junctions by ID array
- `getObjectById(id: number): Junction | null` - Get single junction by ID
- `getSelected(): Junction[]` - Get currently selected junctions
- `getAll(): Junction[]` - Get all loaded junctions
- `getInView(): Junction[]` - Get junctions in current map view
- `create(point: LonLat): Junction` - Create new junction
- `delete(junction: Junction): void` - Delete junction
- `getConnectedSegments(junction: Junction): Segment[]` - Get connected segments
- `getTurns(junction: Junction): Turn[]` - Get junction turns
- `getTurnRestrictions(junction: Junction): TurnRestriction[]` - Get turn restrictions

### Nodes Class

**Description:** Access to map nodes (segment endpoints).

**Key Methods:**
- `getByIds(ids: number[]): Node[]` - Get nodes by ID array
- `getObjectById(id: number): Node | null` - Get single node by ID
- `getAll(): Node[]` - Get all loaded nodes
- `getInView(): Node[]` - Get nodes in current map view
- `getConnectedSegments(node: Node): Segment[]` - Get segments connected to node

### MapComments Class

**Description:** Access to map comments and communication.

**Key Methods:**
- `getByIds(ids: number[]): MapComment[]` - Get comments by ID array
- `getObjectById(id: number): MapComment | null` - Get single comment by ID
- `getAll(): MapComment[]` - Get all loaded comments
- `getInView(): MapComment[]` - Get comments in current map view
- `create(point: LonLat, text: string): MapComment` - Create new comment
- `reply(comment: MapComment, text: string): void` - Reply to comment
- `resolve(comment: MapComment): void` - Mark comment as resolved

### MapProblems Class

**Description:** Access to map problems and reports.

**Key Methods:**
- `getByIds(ids: number[]): MapProblem[]` - Get problems by ID array
- `getObjectById(id: number): MapProblem | null` - Get single problem by ID
- `getAll(): MapProblem[]` - Get all loaded problems
- `getInView(): MapProblem[]` - Get problems in current map view
- `resolve(problem: MapProblem): void` - Mark problem as resolved
- `updateState(problem: MapProblem, state: UpdateableMapProblemState): void` - Update state

### MapUpdateRequests Class

**Description:** Access to place update requests.

**Key Methods:**
- `getByIds(ids: number[]): MapUpdateRequest[]` - Get requests by ID array
- `getObjectById(id: number): MapUpdateRequest | null` - Get single request by ID
- `getAll(): MapUpdateRequest[]` - Get all loaded requests
- `getInView(): MapUpdateRequest[]` - Get requests in current map view
- `approve(request: MapUpdateRequest): void` - Approve update request
- `reject(request: MapUpdateRequest, reason: string): void` - Reject update request

### EditSuggestions Class

**Description:** Access to edit suggestions from the community.

**Key Methods:**
- `getByIds(ids: number[]): EditSuggestion[]` - Get suggestions by ID array
- `getObjectById(id: number): EditSuggestion | null` - Get single suggestion by ID
- `getAll(): EditSuggestion[]` - Get all loaded suggestions
- `getInView(): EditSuggestion[]` - Get suggestions in current map view
- `accept(suggestion: EditSuggestion): void` - Accept edit suggestion
- `reject(suggestion: EditSuggestion, reason: string): void` - Reject edit suggestion

### MajorTrafficEvents Class

**Description:** Access to major traffic events.

**Key Methods:**
- `getByIds(ids: number[]): MajorTrafficEvent[]` - Get events by ID array
- `getObjectById(id: number): MajorTrafficEvent | null` - Get single event by ID
- `getAll(): MajorTrafficEvent[]` - Get all loaded events
- `getInView(): MajorTrafficEvent[]` - Get events in current map view

### RoadClosures Class

**Description:** Access to road closure information.

**Key Methods:**
- `getByIds(ids: number[]): RoadClosure[]` - Get closures by ID array
- `getObjectById(id: number): RoadClosure | null` - Get single closure by ID
- `getAll(): RoadClosure[]` - Get all loaded closures
- `getInView(): RoadClosure[]` - Get closures in current map view

---

## UI & Interaction Classes

### Sidebar Class

**Description:** Manages sidebar tabs and UI elements.

**Key Methods:**
- `registerTab(id: string, config: SidebarTabConfig): RegisterSidebarTabResult` - Register new sidebar tab
- `unregisterTab(id: string): void` - Remove sidebar tab
- `activateTab(id: string): void` - Activate/show specific tab
- `isTabActive(id: string): boolean` - Check if tab is currently active
- `getActiveTab(): string | null` - Get currently active tab ID
- `updateTab(id: string, config: Partial<SidebarTabConfig>): void` - Update tab configuration

**SidebarTabConfig Interface:**
```typescript
interface SidebarTabConfig {
  title: string;                    // Tab title
  content: HTMLElement | string;    // Tab content
  icon?: string;                    // Tab icon
  tooltip?: string;                 // Tooltip text
  onActivate?: () => void;          // Callback when tab activated
  onDeactivate?: () => void;        // Callback when tab deactivated
}
```

### Settings Class

**Description:** Access user settings and preferences.

**Key Methods:**
- `getUserSettings(): UserSettings` - Get current user settings
- `updateUserSettings(settings: Partial<UserSettings>): void` - Update user settings
- `getUnpavedRoadsSetting(): UnpavedRoadsSetting` - Get unpaved roads setting
- `setUnpavedRoadsSetting(setting: UnpavedRoadsSetting): void` - Set unpaved roads setting
- `isLayerEnabled(layerName: string): boolean` - Check if layer is enabled
- `enableLayer(layerName: string): void` - Enable map layer
- `disableLayer(layerName: string): void` - Disable map layer

### Shortcuts Class

**Description:** Keyboard shortcut management.

**Key Methods:**
- `register(config: KeyboardShortcut): void` - Register new keyboard shortcut
- `unregister(id: string): void` - Remove keyboard shortcut
- `isRegistered(id: string): boolean` - Check if shortcut is registered
- `getRegistered(): KeyboardShortcut[]` - Get all registered shortcuts
- `enable(id: string): void` - Enable shortcut
- `disable(id: string): void` - Disable shortcut

**KeyboardShortcut Interface:**
```typescript
interface KeyboardShortcut {
  id: string;                       // Unique identifier
  key: string;                      // Key combination (e.g., 'Ctrl+S')
  description: string;              // Description for users
  callback: () => void;             // Function to execute
  enabled?: boolean;                // Whether shortcut is enabled
  global?: boolean;                 // Whether shortcut works globally
}
```

### LayerSwitcher Class

**Description:** Manage map layer visibility and control.

**Key Methods:**
- `addLayer(layer: TrackedLayer): void` - Add custom layer to map
- `removeLayer(layerId: string): void` - Remove layer from map
- `toggleLayer(layerId: string): void` - Toggle layer visibility
- `isLayerVisible(layerId: string): boolean` - Check layer visibility
- `setLayerVisibility(layerId: string, visible: boolean): void` - Set layer visibility
- `getVisibleLayers(): string[]` - Get list of visible layer IDs
- `addTileLayer(options: TileLayerOptions): void` - Add tile layer

**TileLayerOptions Interface:**
```typescript
interface TileLayerOptions {
  id: string;                       // Layer identifier
  name: string;                     // Display name
  url: string;                      // Tile URL template
  opacity?: number;                 // Layer opacity (0-1)
  zIndex?: number;                  // Layer z-index
  minZoom?: number;                 // Minimum zoom level
  maxZoom?: number;                 // Maximum zoom level
}
```

### SdkEventBus Class

**Description:** Event subscription and handling system.

**Key Methods:**
- `on<T>(eventType: keyof SdkEvents, callback: (event: T) => void): Subscription` - Subscribe to events
- `once<T>(eventType: keyof SdkEvents, callback: (event: T) => void): Subscription` - Subscribe to single event
- `off(subscription: Subscription): void` - Unsubscribe from events
- `emit<T>(eventType: keyof SdkEvents, data: T): void` - Emit custom event

**Key Event Types:**
- `'selectionChanged'` - Map object selection changed
- `'mapMoved'` - Map position/zoom changed
- `'dataModelChanged'` - Data model updated
- `'editingModeChanged'` - Edit mode changed
- `'layerVisibilityChanged'` - Layer visibility changed
- `'featureAdded'` - Custom feature added
- `'featureRemoved'` - Custom feature removed

### WmeState Class

**Description:** Access to application state and user information.

**Key Properties:**
- `user: UserSession` - Current user session information
- `selection: Selection` - Currently selected map objects
- `editingMode: boolean` - Whether editing mode is active
- `permissions: string[]` - User's editing permissions
- `managedAreas: ManagedArea[]` - User's managed areas

**Key Methods:**
- `getUser(): UserSession` - Get current user session
- `getSelection(): Selection` - Get current selection
- `isEditingEnabled(): boolean` - Check if editing is enabled
- `hasPermission(permission: string): boolean` - Check user permission
- `getManagedAreas(): ManagedArea[]` - Get user's managed areas
- `isInManagedArea(point: LonLat): boolean` - Check if point is in managed area

---

## UI Components & Features

### Custom Map Features

**Adding Custom Features:**
```javascript
// Create custom feature
const feature = {
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [-74.006, 40.7128] // [longitude, latitude]
  },
  properties: {
    id: 'custom-marker-1',
    name: 'Custom Marker',
    style: {
      fillColor: '#ff0000',
      strokeColor: '#000000',
      strokeWidth: 2,
      radius: 10
    }
  }
};

// Add to map
sdk.Map.addFeature(feature);

// Remove from map
sdk.Map.removeFeature(feature);
```

### Event Handling Examples

**Selection Change Events:**
```javascript
const subscription = sdk.Events.on('selectionChanged', (event) => {
  console.log('Selection changed:', event.selected, event.deselected);
  
  // Handle selected segments
  event.selected.segments?.forEach(segment => {
    console.log('Selected segment:', segment.id);
  });
  
  // Handle selected venues
  event.selected.venues?.forEach(venue => {
    console.log('Selected venue:', venue.attributes.name);
  });
});

// Unsubscribe when done
sdk.Events.off(subscription);
```

**Map Movement Events:**
```javascript
sdk.Events.on('mapMoved', (event) => {
  console.log('Map moved to:', event.center);
  console.log('Zoom level:', event.zoom);
  console.log('Extent:', event.extent);
});
```

---

## Interfaces

### Core Geometry & Location Interfaces

**LonLat Interface:**
```typescript
interface LonLat {
  lon: number;                      // Longitude coordinate
  lat: number;                      // Latitude coordinate
}
```

**Pixel Interface:**
```typescript
interface Pixel {
  x: number;                        // X coordinate in pixels
  y: number;                        // Y coordinate in pixels
}
```

### Map Object Interfaces

**Segment Interface:**
```typescript
interface Segment {
  id: number;                       // Unique segment ID
  type: 'segment';                  // Object type
  geometry: {
    type: 'LineString';
    coordinates: number[][];         // Array of [lon, lat] points
  };
  attributes: {
    id: number;
    roadType: RoadTypeId;           // Road type (1-22)
    level: number;                  // Elevation level
    direction: SegmentDirection;     // Traffic direction
    lockRank: number;               // Lock rank (0-6)
    length: number;                 // Length in meters
    hasClosures: boolean;           // Has closures
    hasRestrictions: boolean;       // Has turn restrictions
    createdOn: Date;                // Creation date
    updatedOn: Date;                // Last update date
    createdBy: number;              // Creator user ID
    updatedBy: number;              // Last updater user ID
    permissions: SegmentPermission[]; // Vehicle permissions
    routingRoadType: number;        // Routing road type
    flags: SegmentFlagAttributes;   // Segment flags
  };
  address?: SegmentAddress;         // Street address information
}
```

**Venue Interface:**
```typescript
interface Venue {
  id: number;                       // Unique venue ID
  type: 'venue';                    // Object type
  geometry: {
    type: 'Point';
    coordinates: number[];           // [longitude, latitude]
  };
  attributes: {
    id: number;
    name: string;                   // Venue name
    categories: VenueCategory[];     // Venue categories
    permalink: string;              // Venue permalink
    lockRank: number;               // Lock rank (0-6)
    residential: boolean;           // Is residential
    createdOn: Date;                // Creation date
    updatedOn: Date;                // Last update date
    createdBy: number;              // Creator user ID
    updatedBy: number;              // Last updater user ID
    description?: string;           // Venue description
    phone?: string;                 // Phone number
    url?: string;                   // Website URL
    openingHours?: OpeningHour[];   // Operating hours
    services?: ServiceType[];       // Available services
    images?: VenueImage[];          // Venue images
  };
  address: VenueAddress;            // Venue address
}
```

**Junction Interface:**
```typescript
interface Junction {
  id: number;                       // Unique junction ID
  type: 'junction';                 // Object type
  geometry: {
    type: 'Point';
    coordinates: number[];           // [longitude, latitude]
  };
  attributes: {
    id: number;
    createdOn: Date;                // Creation date
    updatedOn: Date;                // Last update date
    createdBy: number;              // Creator user ID
    updatedBy: number;              // Last updater user ID
  };
}
```

**Node Interface:**
```typescript
interface Node {
  id: number;                       // Unique node ID
  type: 'node';                     // Object type
  geometry: {
    type: 'Point';
    coordinates: number[];           // [longitude, latitude]
  };
  attributes: {
    id: number;
    createdOn: Date;                // Creation date
    updatedOn: Date;                // Last update date
  };
}
```

### Address Interfaces

**SegmentAddress Interface:**
```typescript
interface SegmentAddress extends BaseAddress {
  street?: Street;                  // Street information
  city?: City;                      // City information
  state?: State;                    // State information
  country?: Country;                // Country information
  isEmpty: boolean;                 // Whether address is empty
}
```

**VenueAddress Interface:**
```typescript
interface VenueAddress extends BaseAddress {
  houseNumber?: string;             // House number
  street?: Street;                  // Street information
  city?: City;                      // City information
  state?: State;                    // State information
  country?: Country;                // Country information
}
```

**BaseAddress Interface:**
```typescript
interface BaseAddress {
  countryID?: number;               // Country ID
  stateID?: number;                 // State ID
  cityName?: string;                // City name
  streetName?: string;              // Street name
}
```

### Geographic Data Interfaces

**Country Interface:**
```typescript
interface Country {
  id: number;                       // Country ID
  name: string;                     // Country name
  code: string;                     // Country code (e.g., 'US')
}
```

**State Interface:**
```typescript
interface State {
  id: number;                       // State ID
  name: string;                     // State name
  country: Country;                 // Parent country
}
```

**City Interface:**
```typescript
interface City {
  id: number;                       // City ID
  name: string;                     // City name
  state: State;                     // Parent state
  country: Country;                 // Parent country
}
```

**Street Interface:**
```typescript
interface Street {
  id: number;                       // Street ID
  name: string;                     // Street name
  city: City;                       // Parent city
}
```

### User & Session Interfaces

**UserSession Interface:**
```typescript
interface UserSession {
  id: number;                       // User ID
  userName: string;                 // Username
  rank: UserRank;                   // User rank/level
  editingArea: {                    // Editing permissions area
    type: 'Polygon';
    coordinates: number[][][];
  };
  isLoggedIn: boolean;              // Login status
  profile: UserProfile;             // User profile information
}
```

**UserProfile Interface:**
```typescript
interface UserProfile {
  id: number;                       // Profile ID
  userName: string;                 // Username
  rank: UserRank;                   // User rank
  totalEdits: number;               // Total edit count
  createdOn: Date;                  // Account creation date
}
```

**UserSettings Interface:**
```typescript
interface UserSettings {
  units: 'metric' | 'imperial';     // Unit system
  language: string;                 // Interface language
  unpavedRoads: UnpavedRoadsSetting; // Unpaved roads setting
  layersEnabled: string[];          // Enabled layer names
}
```

### Event Interfaces

**SdkEvents Interface:**
```typescript
interface SdkEvents {
  selectionChanged: {
    selected: Selection;             // Newly selected objects
    deselected: Selection;           // Newly deselected objects
  };
  mapMoved: {
    center: LonLat;                 // New map center
    zoom: ZoomLevel;                // New zoom level
    extent: Extent;                 // New map extent
  };
  dataModelChanged: {
    modelName: DataModelName;       // Changed data model
    objects: any[];                 // Changed objects
  };
  editingModeChanged: {
    enabled: boolean;               // Whether editing is enabled
  };
  layerVisibilityChanged: {
    layerId: string;                // Layer identifier
    visible: boolean;               // New visibility state
  };
}
```

**Selection Interface:**
```typescript
interface Selection {
  segments?: Segment[];             // Selected segments
  venues?: Venue[];                 // Selected venues
  junctions?: Junction[];           // Selected junctions
  nodes?: Node[];                   // Selected nodes
  mapComments?: MapComment[];       // Selected comments
  mapProblems?: MapProblem[];       // Selected problems
}
```

---

## Type Aliases

### Core Type Aliases

**RoadTypeId:**
```typescript
type RoadTypeId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22;
// 1: Street, 2: Primary Street, 3: Freeway, 4: Ramp, 5: Walking Trail, 6: Major Highway, 
// 7: Minor Highway, 8: Dirt Road / 4X4 Trail, 15: Ferry, 16: Stairway, 17: Railroad, 
// 18: Runway/Taxiway, 19: Parking Lot Road, 20: Private Road, 22: Pedestrian Boardwalk
```

**SegmentDirection:**
```typescript
type SegmentDirection = 1 | 2 | 3;
// 1: Two-way, 2: One-way (A→B), 3: One-way (B→A)
```

**SegmentPermission:**
```typescript
type SegmentPermission = 'Car' | 'Taxi' | 'Bus' | 'Delivery' | 'Emergency' | 'HOV' | 'Bicycle' | 'Motorcycle';
```

**ZoomLevel:**
```typescript
type ZoomLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
```

**UserRank:**
```typescript
type UserRank = 1 | 2 | 3 | 4 | 5 | 6;
// 1: Area Manager, 2: Country Manager, 3: Regional Manager, 4: Global Champ, 5: Staff, 6: Admin
```

**DataModelName:**
```typescript
type DataModelName = 
  | 'segments' | 'venues' | 'junctions' | 'nodes' | 'mapComments' | 'mapProblems' 
  | 'mapUpdateRequests' | 'editSuggestions' | 'majorTrafficEvents' | 'roadClosures'
  | 'bigJunctions' | 'cities' | 'countries' | 'states' | 'streets' | 'houseNumbers'
  | 'managedAreas' | 'permanentHazards' | 'restrictedDrivingAreas' | 'turnClosures'
  | 'turns' | 'users';
```

**SaveMode:**
```typescript
type SaveMode = 'auto' | 'manual' | 'force';
```

### Venue & Place Type Aliases

**VenueCategoryId:**
```typescript
type VenueCategoryId = 
  | 'AIRPORT' | 'AMUSEMENT_PARK' | 'ARENA_TRACK' | 'ATM' | 'AUTOMOBILE'
  | 'BANK_FINANCE' | 'BEACH' | 'BOOK_STORE' | 'BRIDGE' | 'BUS_STATION'
  | 'BUSINESS_INDUSTRIAL' | 'CEMETERY' | 'CITY_HALL' | 'COLLEGE_UNIVERSITY'
  | 'CONVENIENCE_STORE' | 'DOCTOR_CLINIC' | 'EMBASSY_CONSULATE'
  | 'EMERGENCY_SHELTER' | 'EVENT_CENTER' | 'FARM' | 'FIRE_DEPARTMENT'
  | 'FOREST_GROVE' | 'GAS_STATION' | 'GOVERNMENT' | 'GROCERY_STORE'
  | 'GYM_FITNESS' | 'HOSPITAL_URGENT_CARE' | 'HOTEL' | 'ISLAND'
  | 'JUNCTION_INTERCHANGE' | 'LAKE_POND' | 'LIBRARY' | 'LIGHTHOUSE'
  | 'MILITARY' | 'MUSIC_VENUE' | 'NATURAL_FEATURES' | 'NAUTICAL'
  | 'NEIGHBORHOOD' | 'OFFICE' | 'OTHER' | 'PARK' | 'PARKING_LOT'
  | 'PERSONAL_CARE' | 'PHARMACY' | 'POLICE_STATION' | 'POST_OFFICE'
  | 'PRESCHOOL' | 'PRISON_JAIL' | 'PROFESSIONAL_OTHER' | 'RESTAURANT'
  | 'RIVER_STREAM' | 'SCENIC_LOOKOUT' | 'SCHOOL' | 'SEA_LAKE_POOL'
  | 'SHOPPING_OUTLET' | 'SPORT_VENUE' | 'SUBWAY_STATION' | 'TOLL_BOOTH'
  | 'TOURIST_ATTRACTION' | 'TRANSPORTATION_HUB' | 'TUNNEL' | 'ZOO';
```

**VenueMainCategoryId:**
```typescript
type VenueMainCategoryId = 
  | 'TRANSPORTATION' | 'LODGING' | 'FOOD_AND_DRINK' | 'SHOPPING_AND_SERVICES'
  | 'CULTURE_AND_ENTERTAINMENT' | 'SPORTS_AND_RECREATION' | 'PROFESSIONAL_AND_PUBLIC'
  | 'NATURAL_FEATURES' | 'TRAVEL_TRANSPORT_POINTS';
```

**VenueSubCategoryId:**
```typescript
type VenueSubCategoryId = 
  | 'RESTAURANT_AMERICAN' | 'RESTAURANT_ASIAN' | 'RESTAURANT_BAKERY'
  | 'RESTAURANT_BAR_GRILL' | 'RESTAURANT_BBQ' | 'RESTAURANT_BREAKFAST'
  | 'RESTAURANT_BURGERS' | 'RESTAURANT_CAFE' | 'RESTAURANT_CHINESE'
  | 'RESTAURANT_DESSERT' | 'RESTAURANT_DINER' | 'RESTAURANT_FAST_FOOD'
  | 'RESTAURANT_FRENCH' | 'RESTAURANT_ICE_CREAM' | 'RESTAURANT_INDIAN'
  | 'RESTAURANT_ITALIAN' | 'RESTAURANT_JAPANESE' | 'RESTAURANT_MEDITERRANEAN'
  | 'RESTAURANT_MEXICAN' | 'RESTAURANT_MIDDLE_EASTERN' | 'RESTAURANT_PIZZA'
  | 'RESTAURANT_SEAFOOD' | 'RESTAURANT_STEAKHOUSE' | 'RESTAURANT_SUSHI'
  | 'RESTAURANT_THAI' | 'RESTAURANT_VEGETARIAN';
```

**ServiceType:**
```typescript
type ServiceType = GENERAL_SERVICE_TYPE | PARKING_LOT_SERVICE_TYPE;
```

### Traffic & Navigation Type Aliases

**MajorTrafficEventCategory:**
```typescript
type MajorTrafficEventCategory = 
  | 'ACCIDENT' | 'HAZARD' | 'CONSTRUCTION' | 'EVENT' | 'WEATHER';
```

**ClosureStatus:**
```typescript
type ClosureStatus = 'ACTIVE' | 'SCHEDULED' | 'ENDED';
```

**IssueSeverity:**
```typescript
type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
```

**MapProblemType:**
```typescript
type MapProblemType = 
  | 'GENERAL_ERROR' | 'TURN_NOT_ALLOWED' | 'INCORRECT_JUNCTION'
  | 'WRONG_DRIVING_DIRECTION' | 'MISSING_BRIDGE_OVERPASS'
  | 'MISSING_ROAD' | 'BLOCKED_ROAD' | 'EDIT_BLOCKED_BY_LANDMARK';
```

### Payment & Cost Type Aliases

**PaymentType:**
```typescript
type PaymentType = 'FREE' | 'PAID' | 'UNKNOWN';
```

**PaymentMethod:**
```typescript
type PaymentMethod = 
  | 'CASH' | 'CREDIT_CARD' | 'MOBILE_PAYMENT' | 'CONTACTLESS'
  | 'PREPAID_CARD' | 'SUBSCRIPTION' | 'OTHER';
```

**ParkingLotCostType:**
```typescript
type ParkingLotCostType = 'FREE' | 'PAID' | 'UNKNOWN';
```

**ChargingStationCostType:**
```typescript
type ChargingStationCostType = 'FREE' | 'PAID' | 'MEMBERSHIP' | 'UNKNOWN';
```

### Camera & Detection Type Aliases

**CameraType:**
```typescript
type CameraType = 
  | 'SPEED' | 'RED_LIGHT' | 'SPEED_RED_LIGHT' | 'FAKE' | 'DUMMY';
```

**VehicleType:**
```typescript
type VehicleType = 
  | 'CAR' | 'MOTORCYCLE' | 'TAXI' | 'BUS' | 'DELIVERY' | 'EMERGENCY'
  | 'HOV' | 'BICYCLE' | 'PEDESTRIAN';
```

---

## Constants & Variables

### Data Model Constants

**DATA_MODEL_NAMES:**
```typescript
const DATA_MODEL_NAMES = [
  'segments', 'venues', 'junctions', 'nodes', 'mapComments', 'mapProblems',
  'mapUpdateRequests', 'editSuggestions', 'majorTrafficEvents', 'roadClosures',
  'bigJunctions', 'cities', 'countries', 'states', 'streets', 'houseNumbers',
  'managedAreas', 'permanentHazards', 'restrictedDrivingAreas', 'turnClosures',
  'turns', 'users'
] as const;
```

**ROAD_TYPE:**
```typescript
const ROAD_TYPE = {
  STREET: 1,
  PRIMARY_STREET: 2,
  FREEWAY: 3,
  RAMP: 4,
  WALKING_TRAIL: 5,
  MAJOR_HIGHWAY: 6,
  MINOR_HIGHWAY: 7,
  DIRT_ROAD_4X4_TRAIL: 8,
  FERRY: 15,
  STAIRWAY: 16,
  RAILROAD: 17,
  RUNWAY_TAXIWAY: 18,
  PARKING_LOT_ROAD: 19,
  PRIVATE_ROAD: 20,
  PEDESTRIAN_BOARDWALK: 22
} as const;
```

### Direction & Permission Constants

**SegmentDirection:**
```typescript
const SegmentDirection = {
  TWO_WAY: 1,
  ONE_WAY_AB: 2,
  ONE_WAY_BA: 3
} as const;
```

**SegmentPermission:**
```typescript
const SegmentPermission = {
  CAR: 'Car',
  TAXI: 'Taxi',
  BUS: 'Bus',
  DELIVERY: 'Delivery',
  EMERGENCY: 'Emergency',
  HOV: 'HOV',
  BICYCLE: 'Bicycle',
  MOTORCYCLE: 'Motorcycle'
} as const;
```

### Venue Category Constants

**VENUE_MAIN_CATEGORY:**
```typescript
const VENUE_MAIN_CATEGORY = {
  TRANSPORTATION: 'TRANSPORTATION',
  LODGING: 'LODGING',
  FOOD_AND_DRINK: 'FOOD_AND_DRINK',
  SHOPPING_AND_SERVICES: 'SHOPPING_AND_SERVICES',
  CULTURE_AND_ENTERTAINMENT: 'CULTURE_AND_ENTERTAINMENT',
  SPORTS_AND_RECREATION: 'SPORTS_AND_RECREATION',
  PROFESSIONAL_AND_PUBLIC: 'PROFESSIONAL_AND_PUBLIC',
  NATURAL_FEATURES: 'NATURAL_FEATURES',
  TRAVEL_TRANSPORT_POINTS: 'TRAVEL_TRANSPORT_POINTS'
} as const;
```

**VENUE_SUBCATEGORIES:**
```typescript
const VENUE_SUBCATEGORIES = {
  RESTAURANT_AMERICAN: 'RESTAURANT_AMERICAN',
  RESTAURANT_ASIAN: 'RESTAURANT_ASIAN',
  RESTAURANT_BAKERY: 'RESTAURANT_BAKERY',
  // ... (all subcategory constants)
} as const;
```

### Service Type Constants

**GENERAL_SERVICE_TYPE:**
```typescript
const GENERAL_SERVICE_TYPE = {
  RESTROOMS: 'RESTROOMS',
  WIFI: 'WIFI',
  WHEELCHAIR_ACCESSIBLE: 'WHEELCHAIR_ACCESSIBLE',
  CREDIT_CARDS: 'CREDIT_CARDS',
  RESERVATIONS: 'RESERVATIONS',
  OUTSIDE_SEATING: 'OUTSIDE_SEATING',
  DRIVE_THROUGH: 'DRIVE_THROUGH',
  TAKEAWAY: 'TAKEAWAY',
  DELIVERY: 'DELIVERY',
  VALET_PARKING: 'VALET_PARKING',
  AIR_CONDITIONING: 'AIR_CONDITIONING',
  PARKING: 'PARKING',
  FULL_BAR: 'FULL_BAR',
  LIVE_MUSIC: 'LIVE_MUSIC'
} as const;
```

**PARKING_LOT_SERVICE_TYPE:**
```typescript
const PARKING_LOT_SERVICE_TYPE = {
  VALET_SERVICE: 'VALET_SERVICE',
  PAYMENT_CREDIT_CARDS: 'PAYMENT_CREDIT_CARDS',
  PAYMENT_MOBILE: 'PAYMENT_MOBILE',
  COVERED: 'COVERED',
  ELECTRIC_CHARGING: 'ELECTRIC_CHARGING'
} as const;
```

---

## Complete API Reference

### Common Usage Patterns

#### Working with Segments

**Basic Segment Operations:**
```javascript
// Get selected segments
const selectedSegments = sdk.DataModel.Segments.getSelected();

// Get all segments in view
const segmentsInView = sdk.DataModel.Segments.getInView();

// Find specific segment by ID
const segment = sdk.DataModel.Segments.getObjectById(123456);

// Update segment properties
if (segment) {
  sdk.Editing.beginTransaction();
  
  // Change road type
  sdk.DataModel.Segments.setRoadType(segment, ROAD_TYPE.PRIMARY_STREET);
  
  // Change direction
  sdk.DataModel.Segments.setDirection(segment, SegmentDirection.ONE_WAY_AB);
  
  // Update permissions
  sdk.DataModel.Segments.setPermissions(segment, [
    SegmentPermission.CAR,
    SegmentPermission.TAXI,
    SegmentPermission.EMERGENCY
  ]);
  
  sdk.Editing.commitTransaction();
}
```

**Advanced Segment Analysis:**
```javascript
// Find all segments connected to a junction
const junction = sdk.DataModel.Junctions.getObjectById(789);
const connectedSegments = sdk.DataModel.Junctions.getConnectedSegments(junction);

// Split segment at specific point
const splitPoint = { lon: -74.006, lat: 40.7128 };
const newSegments = sdk.DataModel.Segments.split(segment, splitPoint);

// Merge multiple segments
const segmentsToMerge = [segment1, segment2, segment3];
const mergedSegment = sdk.DataModel.Segments.merge(segmentsToMerge);
```

#### Working with Venues

**Venue Management:**
```javascript
// Create new venue
const venueLocation = { lon: -74.006, lat: 40.7128 };
const newVenue = sdk.DataModel.Venues.create(venueLocation, {
  name: 'New Coffee Shop',
  categories: ['RESTAURANT_CAFE'],
  description: 'Cozy neighborhood coffee shop'
});

// Update venue information
if (newVenue) {
  sdk.Editing.beginTransaction();
  
  // Set basic info
  sdk.DataModel.Venues.setName(newVenue, 'The Perfect Brew');
  sdk.DataModel.Venues.setPhoneNumber(newVenue, '+1-555-123-4567');
  sdk.DataModel.Venues.setURL(newVenue, 'https://perfectbrew.com');
  
  // Set categories
  sdk.DataModel.Venues.setCategories(newVenue, [
    'RESTAURANT_CAFE',
    'RESTAURANT_BREAKFAST'
  ]);
  
  // Set opening hours
  const openingHours = [
    {
      dayOfWeek: 1, // Monday
      openTime: '07:00',
      closeTime: '18:00'
    },
    {
      dayOfWeek: 2, // Tuesday
      openTime: '07:00',
      closeTime: '18:00'
    }
    // ... more days
  ];
  sdk.DataModel.Venues.setOpeningHours(newVenue, openingHours);
  
  sdk.Editing.commitTransaction();
}
```

#### Event Handling & Subscriptions

**Real-time Data Monitoring:**
```javascript
// Subscribe to segment changes
const segmentSubscription = sdk.DataModel.subscribe('segments', (changes) => {
  console.log('Segments changed:', changes);
  
  changes.added?.forEach(segment => {
    console.log('New segment added:', segment.id);
  });
  
  changes.updated?.forEach(segment => {
    console.log('Segment updated:', segment.id);
  });
  
  changes.removed?.forEach(segmentId => {
    console.log('Segment removed:', segmentId);
  });
});

// Subscribe to venue changes
const venueSubscription = sdk.DataModel.subscribe('venues', (changes) => {
  console.log('Venues changed:', changes);
});

// Clean up subscriptions when done
// segmentSubscription.unsubscribe();
// venueSubscription.unsubscribe();
```

**Selection Change Monitoring:**
```javascript
const selectionSubscription = sdk.Events.on('selectionChanged', (event) => {
  // Handle newly selected objects
  if (event.selected.segments?.length > 0) {
    console.log('Selected segments:', event.selected.segments.map(s => s.id));
    
    // Analyze selected segments
    event.selected.segments.forEach(segment => {
      const roadType = sdk.DataModel.Segments.getRoadType(segment);
      const direction = sdk.DataModel.Segments.getDirection(segment);
      const permissions = sdk.DataModel.Segments.getPermissions(segment);
      
      console.log(`Segment ${segment.id}:`, {
        roadType,
        direction,
        permissions
      });
    });
  }
  
  if (event.selected.venues?.length > 0) {
    console.log('Selected venues:', event.selected.venues.map(v => v.attributes.name));
  }
});
```

#### Custom Map Features

**Adding Interactive Elements:**
```javascript
// Add custom markers
function addCustomMarker(lonlat, properties) {
  const marker = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [lonlat.lon, lonlat.lat]
    },
    properties: {
      id: `custom-marker-${Date.now()}`,
      type: 'custom-marker',
      ...properties,
      style: {
        fillColor: properties.color || '#ff0000',
        strokeColor: '#000000',
        strokeWidth: 2,
        radius: 8
      }
    }
  };
  
  sdk.Map.addFeature(marker);
  return marker;
}

// Add custom lines/routes
function addCustomRoute(coordinates, properties) {
  const route = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coordinates // Array of [lon, lat] points
    },
    properties: {
      id: `custom-route-${Date.now()}`,
      type: 'custom-route',
      ...properties,
      style: {
        strokeColor: properties.color || '#0000ff',
        strokeWidth: properties.width || 3,
        strokeOpacity: 0.8
      }
    }
  };
  
  sdk.Map.addFeature(route);
  return route;
}

// Usage examples
const marker1 = addCustomMarker(
  { lon: -74.006, lat: 40.7128 },
  { name: 'Important Location', color: '#ff0000' }
);

const route1 = addCustomRoute([
  [-74.006, 40.7128],
  [-74.008, 40.7130],
  [-74.010, 40.7132]
], { name: 'Custom Route', color: '#00ff00', width: 5 });
```

#### Sidebar Integration

**Creating Custom Sidebar Tabs:**
```javascript
// Create sidebar content
const sidebarContent = document.createElement('div');
sidebarContent.innerHTML = `
  <h3>My Custom Tool</h3>
  <div>
    <label>
      <input type="checkbox" id="showMarkers"> Show Custom Markers
    </label>
  </div>
  <div>
    <button id="analyzeSelection">Analyze Selected Objects</button>
  </div>
  <div id="results"></div>
`;

// Add event listeners
sidebarContent.querySelector('#showMarkers').addEventListener('change', (e) => {
  if (e.target.checked) {
    // Show markers
    showCustomMarkers();
  } else {
    // Hide markers
    hideCustomMarkers();
  }
});

sidebarContent.querySelector('#analyzeSelection').addEventListener('click', () => {
  analyzeSelectedObjects();
});

// Register sidebar tab
const tabResult = sdk.Sidebar.registerTab('my-custom-tool', {
  title: 'Custom Tool',
  content: sidebarContent,
  icon: 'fas fa-tools',
  tooltip: 'My custom WME tool',
  onActivate: () => {
    console.log('Custom tool tab activated');
    refreshData();
  },
  onDeactivate: () => {
    console.log('Custom tool tab deactivated');
  }
});

function analyzeSelectedObjects() {
  const selection = sdk.State.getSelection();
  const results = sidebarContent.querySelector('#results');
  
  let html = '<h4>Selection Analysis:</h4>';
  
  if (selection.segments?.length > 0) {
    html += `<p>Segments: ${selection.segments.length}</p>`;
    selection.segments.forEach(segment => {
      const roadType = sdk.DataModel.Segments.getRoadType(segment);
      html += `<div>Segment ${segment.id}: Road Type ${roadType}</div>`;
    });
  }
  
  if (selection.venues?.length > 0) {
    html += `<p>Venues: ${selection.venues.length}</p>`;
    selection.venues.forEach(venue => {
      html += `<div>Venue: ${venue.attributes.name}</div>`;
    });
  }
  
  results.innerHTML = html;
}
```

#### Keyboard Shortcuts

**Registering Custom Shortcuts:**
```javascript
// Register keyboard shortcuts
sdk.Shortcuts.register({
  id: 'my-tool-toggle',
  key: 'Ctrl+Shift+M',
  description: 'Toggle my custom tool',
  callback: () => {
    const isActive = sdk.Sidebar.isTabActive('my-custom-tool');
    if (isActive) {
      // Switch to another tab or close
      sdk.Sidebar.activateTab('default');
    } else {
      sdk.Sidebar.activateTab('my-custom-tool');
    }
  },
  enabled: true,
  global: true
});

sdk.Shortcuts.register({
  id: 'analyze-selection',
  key: 'Ctrl+Alt+A',
  description: 'Analyze selected objects',
  callback: analyzeSelectedObjects,
  enabled: true
});

sdk.Shortcuts.register({
  id: 'save-changes',
  key: 'Ctrl+S',
  description: 'Save changes to server',
  callback: async () => {
    if (sdk.Editing.hasUnsavedChanges()) {
      try {
        await sdk.Editing.save();
        console.log('Changes saved successfully');
      } catch (error) {
        console.error('Failed to save changes:', error);
      }
    }
  }
});
```

---

## Error Handling

### SDK Error Classes

**WMEError (Base Error):**
```typescript
class WMEError extends Error {
  constructor(message: string, code?: string);
  code?: string;
}
```

**DataModelNotFoundError:**
```typescript
class DataModelNotFoundError extends WMEError {
  constructor(dataModelName: string);
}
```

**InvalidStateError:**
```typescript
class InvalidStateError extends WMEError {
  constructor(operation: string, currentState: string);
}
```

**ValidationError:**
```typescript
class ValidationError extends WMEError {
  constructor(field: string, value: any, reason: string);
  field: string;
  value: any;
}
```

### Error Handling Patterns

```javascript
// Safe data access
try {
  const segments = sdk.DataModel.Segments.getSelected();
  if (segments.length === 0) {
    throw new Error('No segments selected');
  }
  
  // Process segments
  segments.forEach(segment => {
    // Validate segment before processing
    if (!segment || !segment.id) {
      console.warn('Invalid segment found, skipping');
      return;
    }
    
    try {
      const roadType = sdk.DataModel.Segments.getRoadType(segment);
      console.log(`Segment ${segment.id}: Road Type ${roadType}`);
    } catch (error) {
      console.error(`Failed to get road type for segment ${segment.id}:`, error);
    }
  });
  
} catch (error) {
  if (error instanceof sdk.Errors.DataModelNotFoundError) {
    console.error('Data model not available:', error.message);
  } else if (error instanceof sdk.Errors.InvalidStateError) {
    console.error('Invalid operation state:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}

// Safe editing operations
async function safeEdit(editFunction) {
  if (!sdk.Editing.canSave()) {
    throw new Error('Editing not available');
  }
  
  try {
    sdk.Editing.beginTransaction();
    await editFunction();
    sdk.Editing.commitTransaction();
    
    // Auto-save if enabled
    if (sdk.Editing.hasUnsavedChanges()) {
      await sdk.Editing.save();
    }
    
  } catch (error) {
    console.error('Edit operation failed:', error);
    
    // Rollback transaction on error
    if (sdk.Editing.isTransactionActive()) {
      sdk.Editing.rollbackTransaction();
    }
    
    throw error;
  }
}
```

---

## Best Practices

### Performance Optimization

**1. Efficient Data Access:**
```javascript
// Good: Batch operations
const segmentIds = [123, 456, 789];
const segments = sdk.DataModel.Segments.getByIds(segmentIds);

// Avoid: Individual requests
// const segments = segmentIds.map(id => sdk.DataModel.Segments.getObjectById(id));

// Good: Use getInView() for map-based operations
const visibleSegments = sdk.DataModel.Segments.getInView();

// Good: Cache frequently accessed data
const roadTypeCache = new Map();
function getCachedRoadType(segment) {
  if (!roadTypeCache.has(segment.id)) {
    roadTypeCache.set(segment.id, sdk.DataModel.Segments.getRoadType(segment));
  }
  return roadTypeCache.get(segment.id);
}
```

**2. Transaction Management:**
```javascript
// Good: Group related operations
sdk.Editing.beginTransaction();
try {
  // Multiple related edits
  segments.forEach(segment => {
    sdk.DataModel.Segments.setRoadType(segment, ROAD_TYPE.PRIMARY_STREET);
    sdk.DataModel.Segments.setDirection(segment, SegmentDirection.TWO_WAY);
  });
  sdk.Editing.commitTransaction();
} catch (error) {
  sdk.Editing.rollbackTransaction();
  throw error;
}

// Avoid: Many small transactions
// segments.forEach(segment => {
//   sdk.Editing.beginTransaction();
//   sdk.DataModel.Segments.setRoadType(segment, ROAD_TYPE.PRIMARY_STREET);
//   sdk.Editing.commitTransaction();
// });
```

**3. Event Subscription Management:**
```javascript
class MyTool {
  constructor(sdk) {
    this.sdk = sdk;
    this.subscriptions = [];
  }
  
  activate() {
    // Subscribe to events
    this.subscriptions.push(
      this.sdk.Events.on('selectionChanged', this.onSelectionChanged.bind(this)),
      this.sdk.DataModel.subscribe('segments', this.onSegmentsChanged.bind(this))
    );
  }
  
  deactivate() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => {
      if (sub.unsubscribe) {
        sub.unsubscribe();
      } else {
        this.sdk.Events.off(sub);
      }
    });
    this.subscriptions = [];
  }
  
  onSelectionChanged(event) {
    // Handle selection changes
  }
  
  onSegmentsChanged(changes) {
    // Handle segment changes
  }
}
```

### Code Organization

**1. Modular Structure:**
```javascript
// main.js
class WMETool {
  constructor() {
    this.sdk = null;
    this.ui = null;
    this.dataManager = null;
  }
  
  async initialize() {
    this.sdk = await getWmeSdk('my-tool-id', 'My WME Tool');
    this.ui = new UIManager(this.sdk);
    this.dataManager = new DataManager(this.sdk);
    
    this.setupEventHandlers();
    this.ui.createSidebar();
  }
  
  setupEventHandlers() {
    this.sdk.Events.on('selectionChanged', (event) => {
      this.dataManager.updateSelection(event.selected);
      this.ui.refreshDisplay();
    });
  }
}

// ui-manager.js
class UIManager {
  constructor(sdk) {
    this.sdk = sdk;
    this.sidebarContent = null;
  }
  
  createSidebar() {
    this.sidebarContent = this.buildSidebarContent();
    
    this.sdk.Sidebar.registerTab('my-tool', {
      title: 'My Tool',
      content: this.sidebarContent,
      onActivate: () => this.onActivate(),
      onDeactivate: () => this.onDeactivate()
    });
  }
  
  buildSidebarContent() {
    // Build and return sidebar content
  }
}

// data-manager.js
class DataManager {
  constructor(sdk) {
    this.sdk = sdk;
    this.currentSelection = null;
  }
  
  updateSelection(selection) {
    this.currentSelection = selection;
    this.analyzeSelection();
  }
  
  analyzeSelection() {
    // Analyze current selection
  }
}
```

**2. Configuration Management:**
```javascript
const CONFIG = {
  TOOL_NAME: 'My WME Tool',
  TOOL_ID: 'my-wme-tool',
  VERSION: '1.0.0',
  
  // Feature flags
  FEATURES: {
    AUTO_SAVE: true,
    ADVANCED_ANALYSIS: true,
    EXPERIMENTAL_UI: false
  },
  
  // Default settings
  DEFAULTS: {
    ROAD_TYPE: ROAD_TYPE.STREET,
    DIRECTION: SegmentDirection.TWO_WAY,
    PERMISSIONS: [SegmentPermission.CAR]
  },
  
  // UI configuration
  UI: {
    SIDEBAR_TAB_TITLE: 'Tool',
    MARKER_COLOR: '#ff0000',
    LINE_WIDTH: 3
  }
};
```

---

## Migration Guide

### From Legacy WME APIs to SDK

**1. Object Access Migration:**
```javascript
// Legacy (WME globals)
// const selectedSegments = WME.SegmentSelection.getSelectedSegments();
// const segment = WME.model.segments.getObjectById(123);

// SDK equivalent
const selectedSegments = sdk.DataModel.Segments.getSelected();
const segment = sdk.DataModel.Segments.getObjectById(123);
```

**2. Event Handling Migration:**
```javascript
// Legacy (WME events)
// WME.events.on('selectionChange', handler);
// WME.events.on('mapMoved', handler);

// SDK equivalent
sdk.Events.on('selectionChanged', handler);
sdk.Events.on('mapMoved', handler);
```

**3. UI Integration Migration:**
```javascript
// Legacy (direct DOM manipulation)
// const tab = document.createElement('div');
// WME.sidebar.appendChild(tab);

// SDK equivalent
const tabConfig = {
  title: 'My Tool',
  content: myTabContent,
  onActivate: () => console.log('Tab activated')
};
sdk.Sidebar.registerTab('my-tool', tabConfig);
```

**4. Map Interaction Migration:**
```javascript
// Legacy (OpenLayers direct access)
// const center = WME.map.getCenter();
// WME.map.addLayer(customLayer);

// SDK equivalent
const center = sdk.Map.getCenter();
sdk.Map.addFeature(customFeature);
```

### Common Migration Patterns

**Pattern 1: Data Model Access**
```javascript
// Before
function getSegmentInfo(segmentId) {
  const segment = WME.model.segments.getObjectById(segmentId);
  return {
    roadType: segment.attributes.roadType,
    direction: segment.attributes.direction,
    permissions: segment.attributes.permissions
  };
}

// After
function getSegmentInfo(segmentId) {
  const segment = sdk.DataModel.Segments.getObjectById(segmentId);
  if (!segment) return null;
  
  return {
    roadType: sdk.DataModel.Segments.getRoadType(segment),
    direction: sdk.DataModel.Segments.getDirection(segment),
    permissions: sdk.DataModel.Segments.getPermissions(segment)
  };
}
```

**Pattern 2: Event Subscriptions**
```javascript
// Before
WME.events.on('selectionChange', function(e) {
  const selected = e.selected;
  // Handle selection
});

// After
sdk.Events.on('selectionChanged', (event) => {
  const selected = event.selected;
  // Handle selection
});
```

**Pattern 3: Edit Operations**
```javascript
// Before
function updateSegments(segments, newRoadType) {
  WME.beginTransaction();
  segments.forEach(segment => {
    segment.attributes.roadType = newRoadType;
  });
  WME.commitTransaction();
}

// After
function updateSegments(segments, newRoadType) {
  sdk.Editing.beginTransaction();
  try {
    segments.forEach(segment => {
      sdk.DataModel.Segments.setRoadType(segment, newRoadType);
    });
    sdk.Editing.commitTransaction();
  } catch (error) {
    sdk.Editing.rollbackTransaction();
    throw error;
  }
}
```

---

## Complete Script Template

```javascript
// Complete WME SDK Script Template
(async function() {
  'use strict';
  
  // Configuration
  const SCRIPT_ID = 'my-wme-script';
  const SCRIPT_NAME = 'My WME Script';
  const VERSION = '1.0.0';
  
  // State management
  let sdk = null;
  let isInitialized = false;
  const subscriptions = [];
  
  // Initialize SDK
  async function initialize() {
    try {
      sdk = await getWmeSdk(SCRIPT_ID, SCRIPT_NAME);
      console.log(`${SCRIPT_NAME} v${VERSION} initialized with SDK v${sdk.getSDKVersion()}`);
      
      setupEventHandlers();
      createUI();
      
      isInitialized = true;
    } catch (error) {
      console.error(`Failed to initialize ${SCRIPT_NAME}:`, error);
    }
  }
  
  // Event handlers
  function setupEventHandlers() {
    subscriptions.push(
      sdk.Events.on('selectionChanged', handleSelectionChanged),
      sdk.DataModel.subscribe('segments', handleSegmentsChanged)
    );
  }
  
  function handleSelectionChanged(event) {
    console.log('Selection changed:', event.selected);
    // Handle selection changes
  }
  
  function handleSegmentsChanged(changes) {
    console.log('Segments changed:', changes);
    // Handle segment data changes
  }
  
  // UI creation
  function createUI() {
    const sidebarContent = createSidebarContent();
    
    sdk.Sidebar.registerTab(SCRIPT_ID, {
      title: 'My Script',
      content: sidebarContent,
      icon: 'fas fa-tools',
      tooltip: `${SCRIPT_NAME} v${VERSION}`,
      onActivate: () => console.log('Script tab activated'),
      onDeactivate: () => console.log('Script tab deactivated')
    });
    
    // Register keyboard shortcuts
    sdk.Shortcuts.register({
      id: `${SCRIPT_ID}-toggle`,
      key: 'Ctrl+Shift+M',
      description: `Toggle ${SCRIPT_NAME}`,
      callback: toggleScript
    });
  }
  
  function createSidebarContent() {
    const content = document.createElement('div');
    content.innerHTML = `
      <div style="padding: 10px;">
        <h3>${SCRIPT_NAME}</h3>
        <p>Version: ${VERSION}</p>
        <button id="${SCRIPT_ID}-analyze">Analyze Selection</button>
        <div id="${SCRIPT_ID}-results"></div>
      </div>
    `;
    
    // Add event listeners
    content.querySelector(`#${SCRIPT_ID}-analyze`).addEventListener('click', analyzeSelection);
    
    return content;
  }
  
  // Main functionality
  function analyzeSelection() {
    const selection = sdk.State.getSelection();
    const resultsDiv = document.querySelector(`#${SCRIPT_ID}-results`);
    
    let html = '<h4>Analysis Results:</h4>';
    
    if (selection.segments?.length > 0) {
      html += `<p>Found ${selection.segments.length} segments</p>`;
      // Add segment analysis
    }
    
    if (selection.venues?.length > 0) {
      html += `<p>Found ${selection.venues.length} venues</p>`;
      // Add venue analysis
    }
    
    resultsDiv.innerHTML = html;
  }
  
  function toggleScript() {
    const isActive = sdk.Sidebar.isTabActive(SCRIPT_ID);
    if (isActive) {
      sdk.Sidebar.activateTab('default');
    } else {
      sdk.Sidebar.activateTab(SCRIPT_ID);
    }
  }
  
  // Cleanup
  function cleanup() {
    subscriptions.forEach(sub => {
      if (sub.unsubscribe) {
        sub.unsubscribe();
      } else {
        sdk.Events.off(sub);
      }
    });
    
    sdk.Shortcuts.unregister(`${SCRIPT_ID}-toggle`);
    sdk.Sidebar.unregisterTab(SCRIPT_ID);
  }
  
  // Handle page unload
  window.addEventListener('beforeunload', cleanup);
  
  // Start initialization
  initialize();
  
})();
```

---

**This completes the comprehensive WME JavaScript SDK offline reference documentation. This document provides everything needed to develop with the SDK including all classes, interfaces, types, constants, examples, and best practices.**
