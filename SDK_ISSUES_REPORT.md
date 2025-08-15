# WME SDK Usage Issues Report

## Critical Issues That Need Fixing

### 1. Line 68: Incorrect isLoggedIn method call
**Code:** `if (!wmeSDK.State.isLoggedIn()) {`
**Issue:** The SDK's `State` module doesn't have an `isLoggedIn()` method.
**Fix:** Use `wmeSDK.State.userInfo` instead - it returns null if user is not logged in.

### 2. Line 88-90: Invalid event names for WME ready events
**Code:** 
```javascript
wmeSDK.Events.once({ eventName: "wme-map-ready" }),
wmeSDK.Events.once({ eventName: "wme-data-ready" })
```
**Issue:** These event names don't exist in the SDK documentation. 
**Fix:** Use the documented events: `wme-ready` (for full initialization) or `wme-map-data-loaded` (for data ready).

### 3. Line 252: Missing method call
**Code:** `const userInfo = wmeSDK.State.getUserInfo();`
**Issue:** The SDK State module has a `userInfo` property, not a `getUserInfo()` method.
**Fix:** Use `const userInfo = wmeSDK.State.userInfo;`

### 4. Line 268-275: Incorrect Map method call
**Code:** `return wmeSDK.Map.isFeatureVisibleOnMap(obj);`
**Issue:** This method doesn't exist in the SDK documentation.
**Fix:** The SDK doesn't provide a direct equivalent. Need to implement viewport checking manually using map bounds.

### 5. Line 279-283: Non-existent MapUpdateRequests module
**Code:** 
```javascript
const requests = wmeSDK.DataModel.MapUpdateRequests.getAll();
return requests.some(req => req.venueId === venueId);
```
**Issue:** `MapUpdateRequests` is not a documented DataModel module.
**Fix:** This functionality might not be available through the SDK. Consider removing or using W.model fallback.

### 6. Line 293: Incorrect venue property check
**Code:** `return !venue.isAdLocked && wmeSDK.DataModel.Venues.hasPermissions("EDIT_GEOMETRY", venue.id);`
**Issue:** `venue.isAdLocked` property is not documented in the SDK Venue interface.
**Fix:** Use only the permissions check or find alternative property.

### 7. Line 305-312: Incorrect update method signature
**Code:** 
```javascript
await wmeSDK.DataModel.Segments.update({
    objectId: segment.id,
    lockRank: newLockRank
});
```
**Issue:** The SDK uses `updateSegment` method with different parameters.
**Fix:** Use `await wmeSDK.DataModel.Segments.updateSegment({ segmentId: segment.id, lockRank: newLockRank });`

### 8. Line 329-336: Incorrect venue update method
**Code:** 
```javascript
await wmeSDK.DataModel.Venues.update({
    objectId: venue.id,
    lockRank: newLockRank
});
```
**Issue:** The SDK uses `updateVenue` method with different parameters.
**Fix:** Use `await wmeSDK.DataModel.Venues.updateVenue({ venueId: venue.id, lockRank: newLockRank });`

### 9. Line 176-199: Invalid RoadTypeId constant access
**Code:** `[wmeSDK.DataModel.RoadTypes.PRIVATE_ROAD]: {`
**Issue:** RoadTypeId constants are not exposed through DataModel.RoadTypes in the SDK.
**Fix:** Use numeric road type IDs directly or access through W.model if needed.

### 10. Line 1130: Incorrect DataModel method call
**Code:** `const isEditable = await wmeSDK.DataModel.isGeometryEditable(segment);`
**Issue:** This method doesn't exist in the SDK DataModel.
**Fix:** Use segment permissions check: `wmeSDK.DataModel.Segments.hasPermissions("EDIT_GEOMETRY", segment.id)`

### 11. Line 1140-1141: Incorrect street access method
**Code:** 
```javascript
const street = await wmeSDK.DataModel.Streets.getById(segment.primaryStreetID);
const cityID = street?.cityID;
```
**Issue:** Streets.getById method is not documented, and street.cityID property name is unclear.
**Fix:** Use proper SDK method and property names based on Street interface documentation.

### 12. Line 1036-1041: Non-existent createUpdateAction method
**Code:** 
```javascript
const actions = batch.map(obj => wmeSDK.DataModel.createUpdateAction(obj));
await wmeSDK.DataModel.actionManager.add(actions);
```
**Issue:** Neither `createUpdateAction` nor `actionManager` exist in the SDK.
**Fix:** Use individual update methods for segments/venues instead of batch actions.

### 13. Line 1203: Incorrect property access
**Code:** `desiredLockLevel--;`
**Issue:** Lock levels in the SDK start from 0 (not 1), so this decrement is unnecessary.
**Fix:** Remove the decrement or adjust the logic based on SDK's 0-based ranking.

## Minor Issues

### 14. Line 1087: Typo in SDK reference
**Code:** `const address = wmdSDK.Venues.getAddress(venue.id);`
**Issue:** Typo - should be `wmeSDK`, not `wmdSDK`.
**Fix:** Correct the variable name.

### 15. Line 1189: Inconsistent rank comparison logic
**Code:** `if (userlevel > desiredLockLevel) {`
**Issue:** User rank comparison might be incorrect if SDK uses 0-based ranking.
**Fix:** Verify the rank comparison logic based on SDK's rank system.

## Summary

Total Issues: 15 (13 critical, 2 minor)
Most issues stem from:
1. Using non-existent SDK methods and properties
2. Incorrect method signatures and parameter names  
3. Confusion about SDK data structures and naming conventions
4. Missing proper error handling for SDK operations

The script needs significant refactoring to work correctly with the WME SDK v2.305-13-g1b119bf951.
