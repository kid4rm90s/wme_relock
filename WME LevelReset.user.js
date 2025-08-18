// ==UserScript==
// @name         WME LevelReset +
// @version      2025.08.18.001
// @description  Fork of the original script. The WME LevelReset tool, to make re-locking segments and POI to their appropriate lock level easy & quick. Supports major road types and custom locking rules for specific cities.
// @author       Broos Gert '2015, madnut, Copilot
// @match        https://beta.waze.com/*editor*
// @match        https://www.waze.com/*editor*
// @exclude      https://www.waze.com/*user/*editor/*
// @namespace    https://greasyfork.org/uk/users/160654-waze-ukraine
// @connect      google.com
// @connect      script.googleusercontent.com
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        unsafeWindow
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAA+VBMVEX///93PgHX19fTgQfFZgLLcwTrxYDDgA3nqBj5+fmwr6+Yl5f8/PzExMTl5eX114vv7+/e3t68vLzOzs6saRKARQSLTgeioqK2tbX72XfU1NT515fxz4b54b3RmySYWAv31aTpwIHgrn9/f3/75qPZsEvuuC/utx3psVP13KizbhXuuVj745bfoEzzwzDxwDXTjknpxqDPfhzWih7PhUaObErowqDJchrmqCfprRjbmUvblCLZjAv71WnhnyTfmA7hrmbjsm7qxpPv06vYljj305776MvLkD3XkjFwcHCMi4v6zk/6z1P2wVDYqzr3y3j2xWnrrl761X3u0VhGAAABv0lEQVQ4jZWTXXuaMBiGY7bZQUhIoBaKsIK0KkVqtd+2tJ2gnVJs9f//mAW78uHYwe6TXE+em/flJAD8D0RVdF3HTKqvGcaMAiAQVYd1vaEASikhhFKA1ZoeA8Iwct2lCAnAxl/zdcAMbeGipbtwMQM62xFEFUJtoWEIsbh0CVTF3QGqqrjax2cq4kkkFQFjTJD2eYeXBoa4uoEoBOU/RhBUWHWHJukUCZ9JQFCnWkVAQJRQniREyvGPANA/YzazRhBKwjSOg+DZmdoRZ+r8XAfxr5eo1AfzuW1HljXfYkX2zJ5b8TQXXtbWzPff38x2hvn27qf+zFrHubC39tppGoabjczZHIZpmra9/jgXTn2vnSTJaxgecsLwNRkmsueflgV5eLZarU4y+Lk6G9YIg8HxB4PBYEfY3woZQ0529rjQ3y+Evid3ez9K9LpmWTjqe2b3Ti5xlwlHhRDYzdvvFW5NOyiEAy48Pu2VeHps2sFBIUwi5/6hWeLh3okmhdCajJyLLxUunNGktS0lgdLW+agz/lZh3Bmdt6ggZS/NUBqX152brxVuOteXDZVRafsUrxq1XGHIBb6CwHoY4Tt+A1eiQ8S/AAv7AAAAAElFTkSuQmCC
// @downloadURL https://update.greasyfork.org/scripts/457554/WME%20LevelReset%20%2B.user.js
// @updateURL https://update.greasyfork.org/scripts/457554/WME%20LevelReset%20%2B.meta.js
// ==/UserScript==

/* jshint esversion: 11 */
/* global getWmeSdk */

(function () {
    'use strict';

    // Global constants
    const ID_KEYS = {
        MSG_HIDE: 'Relock_msgHide',
        ALL_SEGMENTS: 'Relock_allSegments',
        RESPECT_ROUTING: 'Relock_respectRouting',
        ELM_PREFIX: 'Relock_',
        ELM_CHK: '_chk',
        ELM_VALUE: '_value',
        ROAD_TYPE_VALUE: '_road_type_value'
    };

    const SCRIPT_ID = GM_info.script.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    // Scanning limits
    const SCAN_LIMIT_COUNT = 150;
    const POI_ID = "90000"; // Fake ID for POI to not conflict with real street IDs
    const POI_NAME = "POI";

    // Global SDK instance - initialized once and used by all functions
    let wmeSDK;

    // Centralized error handling system
    const ErrorHandler = {
        // Error severity levels
        SEVERITY: {
            CRITICAL: 'critical',    // Fatal errors that prevent script from working
            ERROR: 'error',          // Errors that affect functionality but allow continuation
            WARNING: 'warning',      // Warnings about potential issues
            INFO: 'info'            // Informational messages
        },

        /**
         * Central error logging and handling function
         * @param {Error|string} error - Error object or message
         * @param {string} context - Context where error occurred (function name, operation)
         * @param {string} severity - Error severity level
         * @param {Object} additionalInfo - Additional context information
         */
        handle(error, context = 'Unknown', severity = this.SEVERITY.ERROR, additionalInfo = {}) {
            const prefix = 'LevelReset:';
            const errorMsg = error instanceof Error ? error.message : String(error);
            const fullMessage = `${prefix} [${context}] ${errorMsg}`;

            // Log to console based on severity - always show stack trace for better debugging
            switch (severity) {
                case this.SEVERITY.CRITICAL:
                    console.error(fullMessage, error instanceof Error ? error.stack : '', additionalInfo);
                    break;
                case this.SEVERITY.ERROR:
                    console.error(fullMessage, error instanceof Error ? error.stack : '', additionalInfo);
                    break;
                case this.SEVERITY.WARNING:
                    console.warn(fullMessage, error instanceof Error ? error.stack : '', additionalInfo);
                    break;
                case this.SEVERITY.INFO:
                    console.log(fullMessage, additionalInfo);
                    break;
                default:
                    console.error(fullMessage, error instanceof Error ? error.stack : '', additionalInfo);
            }

            // Show user-facing alert for critical errors or when explicitly requested
            if (severity === this.SEVERITY.CRITICAL) {
                const userMessage = `${prefix} Critical Error in ${context}\n${errorMsg}\n\nScript may not function properly.`;
                alert(userMessage);
            }

            // Return false for boolean operations, null for others
            return false;
        },

        /**
         * Wrap async functions with error handling
         * @param {Function} asyncFn - Async function to wrap
         * @param {string} context - Context for error reporting
         * @param {string} severity - Default severity level
         * @returns {Function} - Wrapped function with error handling
         */
        wrapAsync(asyncFn, context, severity = this.SEVERITY.ERROR) {
            return async (...args) => {
                try {
                    return await asyncFn(...args);
                } catch (error) {
                    this.handle(error, context, severity);
                    return null;
                }
            };
        },

        /**
         * Create a try/catch wrapper for synchronous functions
         * @param {Function} fn - Function to wrap
         * @param {string} context - Context for error reporting
         * @param {string} severity - Default severity level
         * @param {*} defaultReturn - Default return value on error
         * @returns {Function} - Wrapped function with error handling
         */
        wrapSync(fn, context, severity = this.SEVERITY.ERROR, defaultReturn = false) {
            return (...args) => {
                try {
                    return fn(...args);
                } catch (error) {
                    this.handle(error, context, severity);
                    return defaultReturn;
                }
            };
        }
    };

    /**
    * Async delay utility function
    * @param {number} ms - Milliseconds to wait
    * @returns {Promise<void>}
    */
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * Animate element visibility with smooth transitions
     * Replaces jQuery's show/hide animations with native CSS transitions
     * @param {HTMLElement|string} element - Element or element ID to animate
     * @param {boolean} show - true to show, false to hide
     * @param {string} speed - 'fast' (150ms), 'slow' (600ms), or 'normal' (300ms)
     * @param {string} displayType - CSS display value when showing ('block', 'inline-block', 'table-row', etc.)
     * @example
     * animateElement('alertBox', true, 'fast');  // Show element quickly
     * animateElement(myElement, false, 'slow');  // Hide element slowly
     * animateElement(row, true, 'normal', 'table-row');  // Show table row
     */
    function animateElement(element, show, speed = 'normal', displayType = 'block') {
        // Get element if string ID was passed
        const el = typeof element === 'string' ? document.getElementById(element) : element;
        if (!el) return;

        // Set transition duration based on speed (matching jQuery speeds)
        const durations = {
            'fast': 150,
            'normal': 300,
            'slow': 600
        };
        const duration = durations[speed] || durations.normal;

        // Apply transition CSS
        el.style.transition = `opacity ${duration}ms ease-in-out`;

        if (show) {
            // Show element: set display first, then animate opacity
            el.style.display = displayType;
            el.style.opacity = '0';
            // Small delay to ensure display is applied before opacity change
            setTimeout(() => {
                el.style.opacity = '1';
            }, 10);
        } else {
            // Hide element: animate opacity first, then set display none
            el.style.opacity = '0';
            setTimeout(() => {
                el.style.display = 'none';
                el.style.opacity = '1'; // Reset for next time
            }, duration);
        }
    }

    // Initialize LevelReset and do some checks
    function LevelReset_bootstrap() {

        const initializeSDK = async () => {
            try {
                wmeSDK = getWmeSdk({
                    scriptId: SCRIPT_ID,
                    scriptName: GM_info.script.name
                });

                // Verify required SDK components
                const requiredComponents = [
                    'DataModel',
                    'Events',
                    'State',
                    'Map'
                ];

                for (const component of requiredComponents) {
                    if (!wmeSDK[component]) {
                        throw new Error(`Required SDK component ${component} not available`);
                    }
                }

                // Wait for WME to be fully ready
                await wmeSDK.Events.once({ eventName: "wme-ready" });

                // Verify critical conditions
                if (!wmeSDK.State.isLoggedIn()) {
                    throw new Error('User not logged in');
                }

                // Wait for map data to be loaded
                await wmeSDK.Events.once({ eventName: "wme-map-data-loaded" });

                // Initialize the main script
                await LevelReset_init();

            } catch (error) {
                ErrorHandler.handle(error, 'SDK Initialization', ErrorHandler.SEVERITY.CRITICAL);
            }
        };

        // Main initialization flow
        const waitForSDK = async () => {
            try {
                if (unsafeWindow.SDK_INITIALIZED) {
                    await unsafeWindow.SDK_INITIALIZED;
                    await initializeSDK();
                } else {
                    // Retry after a short delay
                    await delay(500);
                    waitForSDK();
                }
            } catch (err) {
                ErrorHandler.handle(err, 'SDK Promise', ErrorHandler.SEVERITY.CRITICAL);
            }
        };

        // Start initialization when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', waitForSDK);
        } else {
            waitForSDK();
        }
    }

    async function LevelReset_init() {
        try {
            // SDK is already initialized globally, no need to get it again
            if (!wmeSDK) {
                throw new Error('SDK not initialized');
            }

            // Add styles with error handling
            const lrStyle = [
                '.tg { border-collapse: collapse; border-spacing: 0; margin: 0px auto; }',
                '.tg td { border-color: black; border-style: solid; border-width: 1px; overflow: hidden; padding: 2px 2px; word-break: normal; }',
                '.tg .tg-value { text-align: center; vertical-align: top }',
                '.tg .tg-header { background-color: #ecf4ff; border-color: #000000; font-weight: bold; text-align: center; vertical-align: top }',
                '.tg .tg-type { text-align: left; vertical-align: top }',
                // Add better visibility for active elements
                '.tg-row:hover { background-color: #f5f5f5; }',
                '.tg-row.active { background-color: #e8f0fe; }',
                // Improved loader visibility
                '#dotscntr { opacity: 0.8; }',
                '#percentageLoader { transition: width 0.3s ease-in-out; }'
            ];

            try {
                GM_addStyle(lrStyle.join('\n'));
            } catch (styleError) {
                ErrorHandler.handle(styleError, 'Style Injection', ErrorHandler.SEVERITY.WARNING);
                // Fallback to basic styling if GM_addStyle fails
                const style = document.createElement('style');
                style.textContent = lrStyle.join('\n');
                document.head.appendChild(style);
            }
        } catch (error) {
            ErrorHandler.handle(error, 'Main Initialization', ErrorHandler.SEVERITY.CRITICAL);
            return;
        }

        // Script metadata and resources
        const VERSION = GM_info.script.version;

        // Loading indicator image
        const loader = 'data:image/gif;base64,R0lGODlhEAAQAPQAAP///wAAAPj4+Dg4OISEhAYGBiYmJtbW1qioqBYWFnZ2dmZmZuTk5JiYmMbGxkhISFZWVgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+GkNyZWF0ZWQgd2l0aCBhamF4bG9hZC5pbmZvACH5BAAKAAAAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla+KIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAAKAAEALAAAAAAQABAAAAVoICCKR9KMaCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr6CK+o2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkEAAoAAgAsAAAAABAAEAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC+0cwF2GoLLoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU/NXcDBHwkaw1cKQ8MiyEAIfkEAAoAAwAsAAAAABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK+kCNFgjh6QlFYgGO7baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm/4AhACH5BAAKAAQALAAAAAAQABAAAAVgICCOZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYAqrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAAKAAUALAAAAAAQABAAAAVfICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg+boUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0UaFBCkwy3RYKiIYMAC+RAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA==';

        // Default lock levels
        const defaultLocks = {
            STREET: 1,
            PRIMARY_STREET: 1,
            MINOR_HIGHWAY: 2,
            MAJOR_HIGHWAY: 3,
            RAMP: 4,
            FREEWAY: 4,
            POI: 1,
            RAILROAD: 1,
            PRIVATE_ROAD: 1,
            PARKING_LOT_ROAD: 1,
            OFF_ROAD: 1,
            ALLEY: 1,
            PEDESTRIAN_BOARDWALK: 1,
            WALKING_TRAIL: 1,
            STAIRWAY: 1,
            WALKWAY: 1,
            FERRY: 1,
            RUNWAY_TAXIWAY: 1
        };

        // Get road types dynamically from SDK instead of hardcoded mapping
        let roadTypeConfig = {};

        /**
         * Initialize road types from SDK
         * @returns {Object} Road types object with structure: {id: {typeName, scan, sdkType}}
         */
        function initializeRoadTypes() {
            return ErrorHandler.wrapSync(() => {
                const roadTypes = wmeSDK.DataModel.Segments.getRoadTypes();
                const streetTypesMap = {};

                // Add all road types from SDK
                roadTypes.forEach(roadType => {
                    streetTypesMap[roadType.id] = {
                        typeName: roadType.localizedName,
                        scan: true,
                        sdkType: roadType.name
                    };
                });

                // Add special type for POIs (not in SDK road types)
                streetTypesMap[POI_ID] = {
                    typeName: POI_NAME,
                    scan: true,
                    sdkType: POI_NAME
                };

                console.log('LevelReset: Initialized', Object.keys(streetTypesMap).length, 'road types from SDK');
                return streetTypesMap;
            }, 'Road Types Initialization', ErrorHandler.SEVERITY.CRITICAL)(); // Critical error if this fails
        }

        /**
         * Get typeName by sdkType from roadTypeConfig
         * @param {string} sdkType - The SDK type to look up
         * @returns {string} The typeName if found, empty string otherwise
         */
        function getTypeNameBySdkType(sdkType) {
            return ErrorHandler.wrapSync(() => {
                const roadType = Object.values(roadTypeConfig).find(rt => rt.sdkType === sdkType);
                return roadType ? roadType.typeName : "";
            }, 'Type Name Lookup', ErrorHandler.SEVERITY.WARNING)();
        }

        const requestsTimeout = 20000; // in ms
        const rulesHash = "AKfycbyBy5e4J1u3RbRK4cNWbUJ-sDL2aLDUIMH1glbf6xOEEMO0Z4wl2wTKIRw0HP5KDbwR6A";
        let rulesDB = {};
        let relockObject = {};

        function onScreen(obj) {
            if (!obj || !obj.geometry) return false;

            return ErrorHandler.wrapSync(() => {
                // Since SDK doesn't provide isFeatureVisibleOnMap, implement basic viewport check
                // For now, return true as a fallback - in a real implementation you'd calculate map bounds
                // using the map center and zoom level
                const mapCenter = wmeSDK.Map.getMapCenter();
                const zoomLevel = wmeSDK.Map.getZoomLevel();

                if (!mapCenter || zoomLevel === undefined) return false;

                // Simple approximation - in a real implementation, you'd calculate proper bounds
                // based on zoom level and map projection
                const geometry = obj.geometry;
                if (geometry.type === 'Point') {
                    const [lon, lat] = geometry.coordinates;
                    // Simple distance check from map center (very rough approximation)
                    const distance = Math.sqrt(
                        Math.pow(lon - mapCenter.lon, 2) +
                        Math.pow(lat - mapCenter.lat, 2)
                    );
                    // Rough visibility threshold based on zoom level
                    const threshold = Math.pow(2, (18 - zoomLevel)) * 0.01;
                    return distance < threshold;
                } else if (geometry.type === 'LineString') {
                    // Check if any point of the line is within approximate bounds
                    return geometry.coordinates.some(([lon, lat]) => {
                        const distance = Math.sqrt(
                            Math.pow(lon - mapCenter.lon, 2) +
                            Math.pow(lat - mapCenter.lat, 2)
                        );
                        const threshold = Math.pow(2, (18 - zoomLevel)) * 0.01;
                        return distance < threshold;
                    });
                }
                return true; // Default to visible if we can't determine
            }, 'Viewport Visibility Check', ErrorHandler.SEVERITY.WARNING)();
        }

        function hasPendingUR(venueId) {
            return ErrorHandler.wrapSync(() => {
                const requests = wmeSDK.DataModel.MapUpdateRequests.getAll();
                return requests.some(req => req.venueId === venueId);
            }, 'Update Request Check', ErrorHandler.SEVERITY.WARNING)();
        }

        function isVenueEditable(venue) {
            if (!venue || !venue.id) return false;

            return ErrorHandler.wrapSync(() => {
                // Check if venue is not ad-locked and user has edit permissions
                return !venue.isAdLocked && wmeSDK.DataModel.Venues.hasPermissions({
                    permission: "EDIT_GEOMETRY",
                    venueId: venue.id
                });
            }, 'Venue Editability Check', ErrorHandler.SEVERITY.WARNING)();
        }

        function isSegmentEditable(segment) {
            if (!segment || !segment.id) return false;

            return ErrorHandler.wrapSync(() => {
                // Check if segment has no closures and user has edit permissions
                return !segment.hasClosures && wmeSDK.DataModel.Segments.hasPermissions({
                    permission: "EDIT_PROPERTIES",
                    segmentId: segment.id
                });
            }, 'Segment Editability Check', ErrorHandler.SEVERITY.WARNING)();
        }

        /**
         * Update segment lock rank using SDK
         * @param {Object} segment - The segment to update
         * @param {number} newLockRank - New lock rank to set
         * @returns {Promise<boolean>} Success status
         */
        async function updateSegmentLock(segment, newLockRank) {
            if (!segment || !segment.id) return false;

            try {
                // Verify permissions first
                if (!wmeSDK.DataModel.Segments.hasPermissions({
                    permission: "EDIT_PROPERTIES",
                    segmentId: segment.id
                })) {
                    ErrorHandler.handle(`No permission to edit segment: ${segment.id}`, 'Segment Permission Check', ErrorHandler.SEVERITY.WARNING);
                    return false;
                }

                // Update the segment's lock rank
                await wmeSDK.DataModel.Segments.updateSegment({
                    segmentId: segment.id,
                    lockRank: newLockRank
                });

                return true;
            } catch (err) {
                ErrorHandler.handle(err, 'Segment Lock Update', ErrorHandler.SEVERITY.ERROR);
                return false;
            }
        }

        /**
         * Update venue lock rank using SDK
         * @param {Object} venue - The venue to update
         * @param {number} newLockRank - New lock rank to set
         * @returns {Promise<boolean>} Success status
         */
        async function updateVenueLock(venue, newLockRank) {
            if (!venue || !venue.id) return false;

            try {
                // Verify permissions first
                if (!wmeSDK.DataModel.Venues.hasPermissions({
                    permission: "EDIT_GEOMETRY",
                    venueId: venue.id
                })) {
                    ErrorHandler.handle(`No permission to edit venue: ${venue.id}`, 'Venue Permission Check', ErrorHandler.SEVERITY.WARNING);
                    return false;
                }

                // Update the venue's lock rank
                await wmeSDK.DataModel.Venues.updateVenue({
                    venueId: venue.id,
                    lockRank: newLockRank
                });

                return true;
            } catch (err) {
                ErrorHandler.handle(err, 'Venue Lock Update', ErrorHandler.SEVERITY.ERROR);
                return false;
            }
        }

        /**
         * Get road type based on segment properties
         * @param {Object} segment - The segment to check
         * @returns {string|null} Road type name or null if not found
         */
        function getRoadType(segment) {
            if (!segment || !segment.roadType) return null;

            return ErrorHandler.wrapSync(() => {
                // If respecting routing road type is enabled, check that first
                if (localStorage.getItem(ID_KEYS.RESPECT_ROUTING) === 'true' && segment.routingRoadType) {
                    const routingType = roadTypeConfig[segment.routingRoadType];
                    if (routingType) return routingType.sdkType;
                }

                // Fall back to regular road type
                const roadType = roadTypeConfig[segment.roadType];
                return roadType ? roadType.sdkType : null;
            }, 'Road Type Determination', ErrorHandler.SEVERITY.WARNING)();
        }

        /**
         * Check if an object should be reset based on current settings
         * @param {Object} obj - The segment or venue to check
         * @param {number} targetLock - Target lock level
         * @returns {boolean} Whether the object should be reset
         */
        function shouldResetLock(obj, targetLock) {
            if (!obj || typeof obj.lockRank !== 'number' || typeof targetLock !== 'number') {
                return false;
            }

            return ErrorHandler.wrapSync(() => {
                const resetHigher = localStorage.getItem(ID_KEYS.ALL_SEGMENTS) === 'true';
                // Reset if current lock is lower OR if resetHigher is enabled
                return obj.lockRank < targetLock || (resetHigher && obj.lockRank > targetLock);
            }, 'Lock Reset Condition Check', ErrorHandler.SEVERITY.WARNING)();
        }

        function displayHtmlPage(res) {
            if (res.responseText.match(/Authorization needed/) || res.responseText.match(/ServiceLogin/)) {
                ErrorHandler.handle(
                    "Authorization is required for using this script. This is one time action.\nNow you will be redirected to the authorization page, where you'll need to approve request.\nAfter confirmation, please close the page and reload WME.",
                    'Authorization Required',
                    ErrorHandler.SEVERITY.INFO,
                    true
                );
            }
            let w = window.open();
            w.document.open();
            w.document.write(res.responseText);
            w.document.close();
            w.location = res.finalUrl;
        }

        /**
         * Send HTTP request using async/await pattern
         * @param {string} url - URL to request
         * @returns {Promise<Object>} Response object
         */
        async function sendHTTPRequest(url) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    url: url,
                    method: 'GET',
                    timeout: requestsTimeout,
                    onload: function (res) {
                        resolve(res);
                    },
                    onreadystatechange: function (res) {
                        // fill if needed
                    },
                    ontimeout: function (res) {
                        const error = new Error('Request timeout');
                        ErrorHandler.handle(error, 'HTTP Request', ErrorHandler.SEVERITY.CRITICAL);
                        reject(error);
                    },
                    onerror: function (res) {
                        const error = new Error('Request error');
                        ErrorHandler.handle(error, 'HTTP Request', ErrorHandler.SEVERITY.CRITICAL);
                        reject(error);
                    }
                });
            });
        }

        function validateHTTPResponse(res) {
            let result = false;
            let displayError = true;
            if (res) {
                switch (res.status) {
                    case 200:
                        displayError = false;
                        if (res.responseHeaders.match(/content-type:\s*application\/json/i)) {
                            result = true;
                        } else if (res.responseHeaders.match(/content-type:\s*text\/html/i)) {
                            displayHtmlPage(res);
                        }
                        break;
                    default:
                        displayError = false;
                        ErrorHandler.handle(`Unsupported status code: ${res.status}`, 'HTTP Response Validation', ErrorHandler.SEVERITY.CRITICAL, {
                            headers: res.responseHeaders,
                            response: res.responseText
                        });
                        break;
                }
            } else {
                displayError = false;
                ErrorHandler.handle('Response is empty', 'HTTP Response Validation', ErrorHandler.SEVERITY.CRITICAL);
            }

            if (displayError) {
                ErrorHandler.handle('Error processing request', 'HTTP Response Validation', ErrorHandler.SEVERITY.CRITICAL, {
                    response: res.responseText
                });
            }
            return result;
        }

        /**
         * Fetch and process locking rules from external source
         * @returns {Promise<void>}
         */
        async function getAllLockRules() {
            try {
                const url = `https://script.google.com/macros/s/${rulesHash}/exec?func=getAllLockRulesV2`;

                // Use the async HTTP request function
                const response = await sendHTTPRequest(url);

                if (!validateHTTPResponse(response)) {
                    throw new Error('Invalid response received');
                }

                const data = JSON.parse(response.responseText);
                if (data.result !== "success") {
                    throw new Error('Failed to get locking rules: ' + (data.error || 'Unknown error'));
                }

                // Initialize UI with the rules
                await initUI(data.rules);

            } catch (err) {
                ErrorHandler.handle(err, 'Lock Rules Fetching', ErrorHandler.SEVERITY.CRITICAL);
            }
        }

        // Flag to track if a scan is in progress
        let isScanInProgress = false;

        // UI element references for reuse (avoid repeated DOM queries)
        let cachedElements = {
            relockAllbutton: null
        };

        /**
         * Comprehensive scan function for relock preparation
         * @returns {Promise<void>}
         */
        const scanArea = ErrorHandler.wrapAsync(async () => {
            // If a scan is already in progress, skip this one
            if (isScanInProgress) {
                console.debug('LevelReset: Scan already in progress, skipping...');
                return;
            }

            try {
                isScanInProgress = true;
                const topCountry = wmeSDK.DataModel.Countries.getTopCountry();
                if (!topCountry || !topCountry.abbr) {
                    ErrorHandler.handle('Top country not found or invalid', 'Country Retrieval', ErrorHandler.SEVERITY.ERROR);
                    return;
                }
                const userInfo = wmeSDK.State.getUserInfo();
                if (!userInfo) {
                    ErrorHandler.handle('Unable to get user info', 'User Info Retrieval', ErrorHandler.SEVERITY.ERROR);
                    return;
                }
                const userlevel = userInfo.rank + 1;

                // UI elements needed for relocking mode
                let respectRouting = document.getElementById(ID_KEYS.RESPECT_ROUTING);

                if (!(cachedElements.relockAllbutton && respectRouting)) {
                    return;
                }

                hideInactiveCities();

                // Initialize relock object
                Object.values(roadTypeConfig).forEach(function (street) {
                    if (street.sdkType) {
                        relockObject[street.sdkType] = [];
                    }
                });

                // Set up relocking parameters
                let foundBadlocks = false;
                let respectRoutingRoadType = respectRouting.checked;
                let count = 0;

                // Choose country lock settings
                let ABBR = rulesDB[topCountry.abbr] ? rulesDB[topCountry.abbr][0].Locks : defaultLocks;
                console.debug("LevelReset: Rules to be used", ABBR);

                // Disable unchecked road types
                Object.entries(roadTypeConfig).forEach(([key, value]) => {
                    let idPrefix = ID_KEYS.ELM_PREFIX + value.sdkType + ID_KEYS.ELM_CHK;
                    let chk = document.getElementById(idPrefix);
                    value.scan = (chk && chk.checked);
                });

                // Get all data
                const segments = wmeSDK.DataModel.Segments.getAll();
                const venues = wmeSDK.DataModel.Venues.getAll();

                // Process segments
                for (const segment of segments) {
                    try {
                        if (!onScreen(segment)) continue;
                        if (count >= SCAN_LIMIT_COUNT) break;

                        const roadType = getRoadType(segment);
                        if (!roadType) continue;

                        const streetType = Object.values(roadTypeConfig).find(s => s.sdkType === roadType);
                        if (!streetType || !streetType.scan) continue;

                        if (!isSegmentEditable(segment)) continue;

                        const effectiveRoadType = respectRoutingRoadType && segment.routingRoadType
                            ? segment.routingRoadType
                            : segment.roadType;

                        const curStreet = roadTypeConfig[effectiveRoadType];
                        if (!curStreet || !curStreet.scan) continue;

                        let cityID = null;
                        try {
                            if (segment.primaryStreetId) {
                                const street = wmeSDK.DataModel.Streets.getById({ streetId: segment.primaryStreetId });
                                cityID = street ? street.cityId : null;
                            }
                        } catch (err) {
                            console.warn('LevelReset: Could not get street info for segment:', segment.id);
                        }

                        const cityRules = cityID && rulesDB[topCountry.abbr] && rulesDB[topCountry.abbr][cityID];
                        const stLocks = cityRules ? cityRules.Locks : ABBR;
                        const desiredLockLevel = stLocks[curStreet.sdkType] - 1;

                        // setLockLevel logic inline
                        const includeAllSegments = document.getElementById(ID_KEYS.ALL_SEGMENTS);
                        const allSegmentsInclude = includeAllSegments.checked && userlevel > 4;
                        if (userlevel > desiredLockLevel) {
                            if ((segment.lockRank < desiredLockLevel) ||
                                (segment.lockRank > desiredLockLevel && allSegmentsInclude)) {
                                relockObject[curStreet.sdkType].push({
                                    object: segment,
                                    lockRank: desiredLockLevel
                                });
                                foundBadlocks = true;
                                count++;

                                // Update UI counter for this road type
                                const countElement = document.getElementById(ID_KEYS.ELM_PREFIX + curStreet.sdkType + ID_KEYS.ROAD_TYPE_VALUE);
                                if (countElement) {
                                    const currentCount = parseInt(countElement.textContent) || 0;
                                    countElement.textContent = currentCount + 1;
                                }
                            }
                        }
                    } catch (segmentError) {
                        console.error('LevelReset: Error processing segment:', segmentError);
                        continue;
                    }
                }

                // Process venues (POIs)
                if (roadTypeConfig[POI_ID] && roadTypeConfig[POI_ID].scan) {
                    venues.forEach(venue => {
                        if (!onScreen(venue)) return;
                        if (!isVenueEditable(venue)) return;
                        if (hasPendingUR(venue.id)) return;
                        if (count >= SCAN_LIMIT_COUNT) return;

                        // Full relocking logic for POIs
                        const address = wmeSDK.DataModel.Venues.getAddress({ venueId: venue.id });
                        const cityID = address && address.street ? address.street.cityId : null;

                        let desiredLockLevel = (cityID && rulesDB[topCountry.abbr] && rulesDB[topCountry.abbr][cityID])
                            ? rulesDB[topCountry.abbr][cityID].Locks[POI_NAME]
                            : ABBR[POI_NAME];
                        desiredLockLevel--;

                        // setLockLevel logic for venues
                        const includeAllSegments = document.getElementById(ID_KEYS.ALL_SEGMENTS);
                        const allSegmentsInclude = includeAllSegments.checked && userlevel > 4;
                        if (userlevel > desiredLockLevel) {
                            if ((venue.lockRank < desiredLockLevel) ||
                                (venue.lockRank > desiredLockLevel && allSegmentsInclude)) {
                                relockObject[POI_NAME].push({
                                    object: venue,
                                    lockRank: desiredLockLevel
                                });
                                foundBadlocks = true;
                                count++;
                            }
                        }
                    });
                }

                // Build results UI for relocking mode
                Object.entries(relockObject).forEach(([key, value]) => {
                    let __lckRight = document.createElement('div');
                    let __cntRight = document.createElement('div');
                    let idPrefix = ID_KEYS.ELM_PREFIX + key + ID_KEYS.ROAD_TYPE_VALUE;

                    let __prntRight = document.getElementById(idPrefix);
                    __prntRight.innerHTML = '';

                    __cntRight.style.cssText = 'float:right';
                    __lckRight.style.cssText = 'width:15px;float:right;padding:2px 0 0 8px;cursor:pointer;';

                    if (value.length !== 0) {
                        __cntRight.innerHTML = '<b>' + value.length + '</b>';
                        __lckRight.className = 'fa fa-lock';
                        __lckRight.style.cssText += 'color:red;';
                        __lckRight.onclick = function () {
                            relock(relockObject, key);
                        };
                        __prntRight.appendChild(__lckRight);
                    } else {
                        __cntRight.textContent = '-';
                    }

                    __prntRight.appendChild(__cntRight);
                });

                // Update relock button state
                if (foundBadlocks) {
                    cachedElements.relockAllbutton.removeAttribute('disabled');
                    const lockColorElement = document.getElementById('lockcolor');
                    if (lockColorElement) {
                        lockColorElement.style.color = 'red';
                    }
                } else {
                    cachedElements.relockAllbutton.setAttribute('disabled', true);
                    const lockColorElement = document.getElementById('lockcolor');
                    if (lockColorElement) {
                        lockColorElement.style.color = 'green';
                    }
                }
            } finally {
                // Always reset the scan flag when done
                isScanInProgress = false;
            }
        }, 'Area Scanning', ErrorHandler.SEVERITY.WARNING);

        async function initUI(rules) {
            rulesDB = rules;

            // Initialize road types from SDK now that it's ready
            roadTypeConfig = initializeRoadTypes();

            // Create sidebar tab (registerScriptTab returns a Promise)
            const { tabLabel, tabPane } = await wmeSDK.Sidebar.registerScriptTab();

            // Create UI elements
            let relockContent = document.createElement('div');
            let relockTitle = document.createElement('wz-overline');
            let relockSubTitle = document.createElement('wz-label');
            let rulesSubTitle = document.createElement('wz-label');
            let relockAllbutton = document.createElement('input');
            let relockSub = document.createElement('p');
            let versionTitle = document.createElement('wz-label');
            let resultsCntr = document.createElement('div');
            let rulesCntr = document.createElement('div');
            let alertCntr = document.createElement('div');
            let hidebutton = document.createElement('div');
            let dotscntr = document.createElement('div');
            let inputDiv1 = document.createElement('div');
            let inputDiv2 = document.createElement('div');
            let includeAllSegments = document.createElement('input');
            let includeAllSegmentsLabel = document.createElement('label');
            let respectRouting = document.createElement('input');
            let respectRoutingLabel = document.createElement('label');
            let percentageLoader = document.createElement('div');
            let relockTabLabel = document.createTextNode('Re-lock Segments & POI');

            // Create lock status indicator for tab label
            const lockStatusIcon = document.createElement('span');
            lockStatusIcon.id = 'lockcolor';
            lockStatusIcon.className = 'fa fa-lock';
            lockStatusIcon.style.color = 'green'; // Default to green (no issues found)
            
            tabLabel.innerHTML = "Re-";
            tabLabel.appendChild(lockStatusIcon);
            relockTitle.appendChild(relockTabLabel);

            // fill tab
            relockSub.innerHTML = 'Your on-screen area is automatically scanned when you load or pan around. Pressing the lock behind each type will relock only those results, or you can choose to relock all.<br/><br/>You can only relock segments lower or equal to your current editor level. Segments locked higher than normal are left alone.';
            relockSub.style.cssText = 'font-size:85%;padding:15px;border:1px solid red;border-radius:5px;position:relative';
            relockSub.id = 'sub';
            hidebutton.style.cssText = 'cursor:pointer;width:16px;height:16px;position:absolute;right:3px;top:3px;background-image:url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMTEvMjAvMTVnsXrkAAADTUlEQVQ4jW2TW0xbZQCAv3ODnpYWegEGo1wKwzBcxAs6dONSjGMm3kjmnBqjYqLREE2WLDFTIBmbmmxRpzHy4NPi4zRLfNBlZjjtnCEaOwYDJUDcVqC3UzpWTkt7fp80hvk9f/nePkkIwWb+gA5jMXLQjK50Zc2cuKVp4wlX2UevtAYubnal/waWoTI1N38keu7ck2uTl335ZFJCkpE8XlGob4ibgeZvMl7P8MtdO6/dFohDe/Sn0LdzJ457MuHfUYqLkYtsSIqMJASyIiNv30Gm6+G1zNbqvpf6gqF/AwaUXx+/MDdz6KArH4ujVVRAbgPVroMsQz6P6nJiGUnUGj/pR/tTyx2dtW+11t2UAa5Pz34w//GHLitpsG1wkODp0xQ11GOZJpgmzq5uqo8ew76zAxFPUDJxscwzFR4BkGfh/tj58/3Zq9OoFZU0PHsAd00NnWNj6IEApd3duA48g2nXKenpQSl1oceWsUeuPfdp+M9GZf/zA5+lz3x9lxRbAUli+dIlKnt7Ud1uCk1NJH0+VnMmq6EQfw0NUzCSULBQfT4HVf4iNRO50VlIGSi6jup0sj5zlTO7d9N48iRLa2vkCwWsyTArbx/GAaSBm/MLyLm85OjZs0c2zawQsoRmt5NeXCRyeRLh9rBkGBSEwF6i09h+L96GemyAx2bDK4ENkGRJkbM2fVy4PRhT08RmZvH09VE29C6ixEFuahL3hklLby9PhEKUt7VRZln4kHD669Bqtl6Q7W07jqWL9FQiEkHTdUoGBsgXF5EPh0m8M8Tc62/CSoLSqmqaR4ZxaRpenxfbgw8lCy2Nx5Uv3xuNXEll7shO/HI38Rjr09NImkriyCgOy0JZTZM4+x3C7SY+epTaLZWsdwXJPNV/6jF/9ReSEIKzmcKWpbHPF9OHDxUr6xksoAiQJAmnpuEWAqeq4G9uRr7nPpZeeDG10NqybV+5Ly4DPGJXlsv79u51v38iK22/EwmwACEEIpdD2tjApmncan8A49XX4qtNgeC+cl/8tpm+jxoBY+K3N7I/jj+dvxKuIhZV7KpKWV295dy1K6YEg1/NO2wj+/210f+98R9+hub0wo1BOZnslRVV16orf0hVeD55HH7d7P4N0V1gY9/zcaEAAAAASUVORK5CYII=\');';
            hidebutton.onclick = () => {
                localStorage.setItem(ID_KEYS.MSG_HIDE, '1');
                animateElement('sub', false, 'slow');
            };
            dotscntr.style.cssText = 'width:16px;height:16px;margin-left:5px;background:url("' + loader + '");vertical-align:text-top;display:none';
            dotscntr.id = 'dotscntr';
            relockSubTitle.innerHTML = 'Results (limited to ' + SCAN_LIMIT_COUNT + ' per pass)';
            relockSubTitle.id = 'reshdr';
            rulesSubTitle.innerHTML = 'Active rules';
            versionTitle.innerHTML = 'Version ' + VERSION;
            relockAllbutton.id = 'rlkall';
            relockAllbutton.type = 'button';
            relockAllbutton.value = 'Relock All';
            relockAllbutton.style.cssText = 'margin: 10px 3px 0 0';
            relockAllbutton.onclick = () => {
                relockAll();
            };

            // Store references to avoid repeated DOM queries
            cachedElements.relockAllbutton = relockAllbutton;

            // Also reset higher locked segments?
            includeAllSegments.type = 'checkbox';
            includeAllSegments.name = "name";
            includeAllSegments.value = "value";
            includeAllSegments.checked = (localStorage.getItem(ID_KEYS.ALL_SEGMENTS) == 'true');
            includeAllSegments.id = ID_KEYS.ALL_SEGMENTS;
            includeAllSegments.onclick = () => {
                localStorage.setItem(ID_KEYS.ALL_SEGMENTS, includeAllSegments.checked.toString());
                scanArea(); // No parameters needed
                relockShowAlert();
            };
            includeAllSegmentsLabel.htmlFor = ID_KEYS.ALL_SEGMENTS;
            includeAllSegmentsLabel.innerHTML = 'Also reset higher locked objects';
            includeAllSegmentsLabel.style.cssText = 'font-size:95%;margin-left:5px;vertical-align:middle';

            // Respect routing road type
            respectRouting.type = 'checkbox';
            respectRouting.name = "name";
            respectRouting.value = "value";
            respectRouting.checked = (localStorage.getItem(ID_KEYS.RESPECT_ROUTING) == 'true');
            respectRouting.id = ID_KEYS.RESPECT_ROUTING;
            respectRouting.onclick = () => {
                localStorage.setItem(ID_KEYS.RESPECT_ROUTING, respectRouting.checked.toString());
                scanArea(); // No parameters needed
            };
            respectRoutingLabel.htmlFor = ID_KEYS.RESPECT_ROUTING;
            respectRoutingLabel.innerHTML = 'Respect routing road type';
            respectRoutingLabel.style.cssText = 'font-size:95%;margin-left:5px;vertical-align:middle';

            resultsCntr.style.cssText = 'margin-right:5px;';

            // add results empty list
            Object.entries(roadTypeConfig).forEach(([key, value]) => {
                // Create UI elements for road type
                let __cntr = document.createElement('div');
                let __keyLeft = document.createElement('div');
                let __prntRight = document.createElement('div');
                let __cntRight = document.createElement('div');
                let __cleardiv = document.createElement("div");
                let __chkLeft = document.createElement('input');
                let __lblLeft = document.createElement('label');
                let idPrefix = ID_KEYS.ELM_PREFIX + value.sdkType;

                // Begin building
                __keyLeft.style.cssText = 'float:left';

                __chkLeft.type = 'checkbox';
                __chkLeft.checked = (localStorage.getItem(idPrefix + ID_KEYS.ELM_CHK) == 'true');
                __chkLeft.id = idPrefix + ID_KEYS.ELM_CHK;
                __chkLeft.onclick = function () {
                    localStorage.setItem(idPrefix + ID_KEYS.ELM_CHK, __chkLeft.checked.toString());
                    scanArea(); // No parameters needed
                };
                __lblLeft.htmlFor = idPrefix + ID_KEYS.ELM_CHK;
                __lblLeft.innerHTML = value.typeName;
                __lblLeft.style.cssText = 'margin-bottom:0px;font-weight:normal;';

                __keyLeft.appendChild(__chkLeft);
                __keyLeft.appendChild(__lblLeft);

                __cntRight.style.cssText = 'float:right';
                __cntRight.textContent = '-';

                __prntRight.id = idPrefix + ID_KEYS.ROAD_TYPE_VALUE;
                __prntRight.style.cssText = 'float:right';
                __prntRight.appendChild(__cntRight);

                __cleardiv.style.cssText = 'clear:both;';

                // Add to stage
                __cntr.appendChild(__keyLeft);
                __cntr.appendChild(__prntRight);
                __cntr.appendChild(__cleardiv);
                resultsCntr.appendChild(__cntr);
            });

            // Alert box
            alertCntr.id = "alertCntr";
            alertCntr.style.cssText = 'border:1px solid #EBCCD1;background-color:#F2DEDE;color:#AC4947;font-weight:bold;font-size:90%;border-radius:5px;padding:10px;margin:5px 5px;display:none';
            alertCntr.innerHTML = 'Watch out for map exceptions, some higher locks are there for a reason!';

            // Rules table
            let rowElm;
            let colElm;

            let tableElm = document.createElement('table');
            tableElm.className = 'tg';

            let bodyElm = document.createElement('tbody');

            let countryRules = null;
            const topCountry = wmeSDK.DataModel.Countries.getTopCountry();
            if (topCountry && topCountry.abbr) {
                countryRules = rulesDB[topCountry.abbr];
            } else {
                ErrorHandler.handle('Top country not found or invalid', 'Country Retrieval in initUI', ErrorHandler.SEVERITY.ERROR);
            }

            if (countryRules) {
                Object.entries(countryRules).forEach(([key, value]) => {
                    if (key == "CountryName") return;

                    rowElm = document.createElement('tr');
                    rowElm.className = "tg-row";
                    rowElm.dataset.name = parseInt(key) === 0 ? 'country' : value.CityName; // need to hard code 'country' to identify later

                    colElm = document.createElement('td');
                    colElm.className = "tg-header";
                    colElm.innerHTML = parseInt(key) === 0 ? countryRules.CountryName : value.CityName;
                    colElm.colSpan = 6;
                    rowElm.appendChild(colElm);
                    tableElm.appendChild(rowElm);

                    const maxCol = 3;
                    let colIndex = 0;
                    rowElm = document.createElement('tr');
                    Object.entries(value.Locks).forEach(([k, v]) => {
                        if (v) {
                            rowElm.className = "tg-row";
                            rowElm.dataset.name = parseInt(key) === 0 ? 'country' : value.CityName; // need to hard code 'country' to identify later
                            if (colIndex < maxCol) {
                                colElm = document.createElement('td');
                                colElm.className = "tg-type";
                                colElm.innerHTML = getTypeNameBySdkType(k) || k;
                                rowElm.appendChild(colElm);

                                colElm = document.createElement('td');
                                colElm.className = "tg-value";
                                colElm.innerHTML = v;
                                rowElm.appendChild(colElm);

                                colIndex++;
                                if (colIndex == maxCol) {
                                    colIndex = 0;
                                    tableElm.appendChild(rowElm);
                                    rowElm = document.createElement('tr');
                                }
                            }
                        }
                    });
                    tableElm.appendChild(rowElm);
                });
            }

            tableElm.appendChild(bodyElm);
            rulesCntr.style.cssText = 'font-size:12px';
            rulesCntr.appendChild(tableElm);

            // add to stage
            relockContent.appendChild(relockTitle);
            relockContent.appendChild(versionTitle);

            // Loader bar
            percentageLoader.id = 'percentageLoader';
            percentageLoader.style.cssText = 'width:1px;height:10px;background-color:green;margin-top:10px;border:1px solid:#333333;display:none';

            // only show if user didn't hide it before
            if (localStorage.getItem(ID_KEYS.MSG_HIDE) !== '1') {
                relockSub.appendChild(hidebutton);
                relockContent.appendChild(relockSub);
            }

            inputDiv1.appendChild(respectRouting);
            inputDiv1.appendChild(respectRoutingLabel);
            inputDiv2.appendChild(includeAllSegments);
            inputDiv2.appendChild(includeAllSegmentsLabel);
            relockContent.appendChild(inputDiv1);
            relockContent.appendChild(inputDiv2);

            relockContent.appendChild(alertCntr);
            relockContent.appendChild(relockSubTitle);
            relockContent.appendChild(resultsCntr);
            relockContent.appendChild(relockAllbutton);
            relockContent.appendChild(dotscntr);
            relockContent.appendChild(percentageLoader);
            relockContent.appendChild(rulesSubTitle);
            relockContent.appendChild(rulesCntr);

            tabPane.appendChild(relockContent);

            // Register event handlers using SDK with proper error handling
            const eventHandlers = [];

            function registerEventHandler(eventName, handler) {
                return ErrorHandler.wrapSync(() => {
                    const subscription = wmeSDK.Events.on({
                        eventName: eventName,
                        eventHandler: handler
                    });
                    eventHandlers.push(subscription);
                    return subscription;
                }, `Event Handler Registration (${eventName})`, ErrorHandler.SEVERITY.ERROR)();
            }

            // Create different handlers for different events
            const scanHandler = () => scanArea(); // All events now use the same handler

            // Register for map data changes
            //registerEventHandler("wme-map-data-loaded", scanHandler);

            // Register for map movements
            registerEventHandler("wme-map-move-end", scanHandler);

            // Register for edits
            registerEventHandler("wme-after-edit", scanHandler);

            // Clean up function for event handlers
            function cleanup() {
                eventHandlers.forEach(handler => {
                    try {
                        handler.remove();
                    } catch (err) {
                        console.error('LevelReset: Error removing event handler:', err);
                    }
                });
                eventHandlers.length = 0;
            }

            // Register cleanup handlers
            const cleanupScript = () => {
                try {
                    // Remove event handlers
                    cleanup();

                    // Clean up UI elements
                    const tabElement = document.getElementById('sidepanel-relockTab');
                    if (tabElement) {
                        tabElement.remove();
                    }

                    // Clean up any active operations
                    if (window.relockTimer) {
                        clearTimeout(window.relockTimer);
                    }

                    // Remove any remaining loaders
                    const loader = document.getElementById('dotscntr');
                    if (loader) {
                        loader.style.display = 'none';
                    }

                    console.log('LevelReset: Cleanup completed successfully');
                } catch (error) {
                    console.error('LevelReset: Error during cleanup:', error);
                }
            };

            // Register cleanup for both unload and disable scenarios
            if (typeof window.addEventListener === 'function') {
                window.addEventListener('beforeunload', cleanupScript);
            }

            // Register for undo/redo operations
            wmeSDK.Events.on({
                eventName: "wme-after-undo",
                eventHandler: scanHandler
            });

            wmeSDK.Events.on({
                eventName: "wme-no-edits",
                eventHandler: scanHandler
            });

            // Initial scan
            relockShowAlert();
            scanHandler();
        }

        async function relock(obj, key) {
            let dotscntrElement;
            let percentageLoaderElement;
            
            try {
                const objects = obj[key];
                let i = 0;
                const total = objects.length;

                // Get container width once instead of parsing CSS repeatedly
                const container = document.getElementById('sidepanel-relockTab');
                const containerWidth = container ? container.offsetWidth : 300;

                // Update GUI progress
                const updateProgress = () => {
                    const progress = (i / total) * 100;
                    const newWidth = (progress / 100) * containerWidth;
                    percentageLoaderElement = document.getElementById('percentageLoader');
                    dotscntrElement = document.getElementById('dotscntr');
                    
                    if (percentageLoaderElement) {
                        percentageLoaderElement.style.display = 'block';
                        percentageLoaderElement.style.width = newWidth + 'px';
                    }
                    if (dotscntrElement) {
                        dotscntrElement.style.display = 'inline-block';
                    }
                };

                // Process objects individually since SDK doesn't support batch actions
                for (const feature of objects) {
                    try {
                        if (key === POI_NAME) {
                            await updateVenueLock(feature.object, feature.lockRank);
                        } else {
                            await updateSegmentLock(feature.object, feature.lockRank);
                        }

                        i++;
                        updateProgress();

                        // Small delay to prevent overwhelming the system
                        if (i % 10 === 0) {
                            await delay(100);
                        }
                    } catch (err) {
                        console.error('LevelReset: Error updating feature:', err);
                        continue;
                    }
                }

                dotscntrElement = document.getElementById('dotscntr');
                percentageLoaderElement = document.getElementById('percentageLoader');
                
                if (dotscntrElement) {
                    dotscntrElement.style.display = 'none';
                }
                if (percentageLoaderElement) {
                    percentageLoaderElement.style.display = 'none';
                }
            } catch (error) {
                console.error('LevelReset: Error in relock operation:', error);
                dotscntrElement = document.getElementById('dotscntr');
                percentageLoaderElement = document.getElementById('percentageLoader');
                
                if (dotscntrElement) {
                    dotscntrElement.style.display = 'none';
                }
                if (percentageLoaderElement) {
                    percentageLoaderElement.style.display = 'none';
                }
            }
        }

        async function relockAll() {
            let dotscntrElement;
            let percentageLoaderElement;
            
            try {
                dotscntrElement = document.getElementById('dotscntr');
                if (dotscntrElement) {
                    dotscntrElement.style.display = 'inline-block';
                }

                // Get container width once for all progress calculations
                const container = document.getElementById('sidepanel-relockTab');
                const containerWidth = container ? container.offsetWidth : 300;

                // Process each type of feature (segments, POIs, etc.)
                for (const [key, objects] of Object.entries(relockObject)) {
                    if (objects.length === 0) continue;

                    let processed = 0;
                    const total = objects.length;

                    // Process objects individually
                    for (const feature of objects) {
                        try {
                            if (key === POI_NAME) {
                                await updateVenueLock(feature.object, feature.lockRank);
                            } else {
                                await updateSegmentLock(feature.object, feature.lockRank);
                            }

                            processed++;

                            // Update progress bar
                            const progress = (processed / total) * 100;
                            const newWidth = (progress / 100) * containerWidth;
                            percentageLoaderElement = document.getElementById('percentageLoader');
                            
                            if (percentageLoaderElement) {
                                percentageLoaderElement.style.display = 'block';
                                percentageLoaderElement.style.width = newWidth + 'px';
                            }

                            // Small delay every 10 updates to prevent overwhelming the system
                            if (processed % 10 === 0) {
                                await delay(100);
                            }
                        } catch (err) {
                            console.error('LevelReset: Error updating feature:', err);
                            continue;
                        }
                    }
                }

                await scanArea();

                dotscntrElement = document.getElementById('dotscntr');
                percentageLoaderElement = document.getElementById('percentageLoader');
                
                if (dotscntrElement) {
                    animateElement(dotscntrElement, false, 'normal');
                }
                if (percentageLoaderElement) {
                    percentageLoaderElement.style.display = 'none';
                }
            } catch (error) {
                console.error('LevelReset: Error in relockAll operation:', error);
                dotscntrElement = document.getElementById('dotscntr');
                percentageLoaderElement = document.getElementById('percentageLoader');
                
                if (dotscntrElement) {
                    animateElement(dotscntrElement, false, 'normal');
                }
                if (percentageLoaderElement) {
                    percentageLoaderElement.style.display = 'none';
                }
            }
        }

        function relockShowAlert() {
            let includeAllSegments = document.getElementById(ID_KEYS.ALL_SEGMENTS);

            if (includeAllSegments && includeAllSegments.checked) {
                animateElement('alertCntr', true, 'fast');
            } else {
                animateElement('alertCntr', false, 'fast');
            }
        }

        function hideInactiveCities() {
            const allRows = document.querySelectorAll('tr.tg-row');
            allRows.forEach((row) => {
                let isActive = false;
                const cities = wmeSDK.DataModel.Cities.getAll();
                for (let city of cities) {
                    if (city.name === row.dataset.name) {
                        isActive = true;
                        break;
                    }
                }

                if (isActive || row.dataset.name == 'country') {
                    animateElement(row, true, 'fast', 'table-row');
                } else {
                    animateElement(row, false, 'fast');
                }
            });
        }

        await getAllLockRules();
    }

    LevelReset_bootstrap();
})();