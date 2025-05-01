// ==UserScript==
// @name         WME LevelReset +
// @version      2025.05.02.001
// @description  Fork of the original script. The WME LevelReset tool, to make re-locking segments and POI to their appropriate lock level easy & quick. Supports major road types and custom locking rules for specific cities.
// @author       Broos Gert '2015, madnut
// @match        https://beta.waze.com/*editor*
// @match        https://www.waze.com/*editor*
// @exclude      https://www.waze.com/*user/*editor/*
// @namespace    https://greasyfork.org/uk/users/160654-waze-ukraine
// @connect      google.com
// @connect      script.googleusercontent.com
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAA+VBMVEX///93PgHX19fTgQfFZgLLcwTrxYDDgA3nqBj5+fmwr6+Yl5f8/PzExMTl5eX114vv7+/e3t68vLzOzs6saRKARQSLTgeioqK2tbX72XfU1NT515fxz4b54b3RmySYWAv31aTpwIHgrn9/f3/75qPZsEvuuC/utx3psVP13KizbhXuuVj745bfoEzzwzDxwDXTjknpxqDPfhzWih7PhUaObErowqDJchrmqCfprRjbmUvblCLZjAv71WnhnyTfmA7hrmbjsm7qxpPv06vYljj305776MvLkD3XkjFwcHCMi4v6zk/6z1P2wVDYqzr3y3j2xWnrrl761X3u0VhGAAABv0lEQVQ4jZWTXXuaMBiGY7bZQUhIoBaKsIK0KkVqtd+2tJ2gnVJs9f//mAW78uHYwe6TXE+em/flJAD8D0RVdF3HTKqvGcaMAiAQVYd1vaEASikhhFKA1ZoeA8Iwct2lCAnAxl/zdcAMbeGipbtwMQM62xFEFUJtoWEIsbh0CVTF3QGqqrjax2cq4kkkFQFjTJD2eYeXBoa4uoEoBOU/RhBUWHWHJukUCZ9JQFCnWkVAQJRQniREyvGPANA/YzazRhBKwjSOg+DZmdoRZ+r8XAfxr5eo1AfzuW1HljXfYkX2zJ5b8TQXXtbWzPff38x2hvn27qf+zFrHubC39tppGoabjczZHIZpmra9/jgXTn2vnSTJaxgecsLwNRkmsueflgV5eLZarU4y+Lk6G9YIg8HxB4PBYEfY3woZQ0529rjQ3y+Evid3ez9K9LpmWTjqe2b3Ti5xlwlHhRDYzdvvFW5NOyiEAy48Pu2VeHps2sFBIUwi5/6hWeLh3okmhdCajJyLLxUunNGktS0lgdLW+agz/lZh3Bmdt6ggZS/NUBqX152brxVuOteXDZVRafsUrxq1XGHIBb6CwHoY4Tt+A1eiQ8S/AAv7AAAAAElFTkSuQmCC
// @downloadURL https://update.greasyfork.org/scripts/457554/WME%20LevelReset%20%2B.user.js
// @updateURL https://update.greasyfork.org/scripts/457554/WME%20LevelReset%20%2B.meta.js
// ==/UserScript==

/* jshint esversion: 11 */
/* global W */
/* global $ */
/* global require */

// initialize LevelReset and do some checks
function LevelReset_bootstrap() {
    if (W?.userscripts?.state.isReady) {
        LevelReset_init();
    } else {
        document.addEventListener("wme-ready", LevelReset_init, {
            once: true
        });
    }
}

function LevelReset_init() {
    // Setting up global variables
    const lrStyle = [
        '.tg { border-collapse: collapse; border-spacing: 0; margin: 0px auto; }',
        '.tg td { border-color: black; border-style: solid; border-width: 1px; overflow: hidden; padding: 2px 2px; word-break: normal; }',
        '.tg .tg-value { text-align: center; vertical-align: top }',
        '.tg .tg-header { background-color: #ecf4ff; border-color: #000000; font-weight: bold; text-align: center; vertical-align: top }',
        '.tg .tg-type { text-align: left; vertical-align: top }',
        ''];
    GM_addStyle(lrStyle.join('\n'));

    const UpdateObject = require("Waze/Action/UpdateObject");
    const VERSION = GM_info.script.version;
    const loader = 'data:image/gif;base64,R0lGODlhEAAQAPQAAP///wAAAPj4+Dg4OISEhAYGBiYmJtbW1qioqBYWFnZ2dmZmZuTk5JiYmMbGxkhISFZWVgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+GkNyZWF0ZWQgd2l0aCBhamF4bG9hZC5pbmZvACH5BAAKAAAAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla+KIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAAKAAEALAAAAAAQABAAAAVoICCKR9KMaCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr6CK+o2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkEAAoAAgAsAAAAABAAEAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC+0cwF2GoLLoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU/NXcDBHwkaw1cKQ8MiyEAIfkEAAoAAwAsAAAAABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK+kCNFgjh6QlFYgGO7baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm/4AhACH5BAAKAAQALAAAAAAQABAAAAVgICCOZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYAqrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAAKAAUALAAAAAAQABAAAAVfICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg+boUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0UaFBCkwy3RYKiIYMAC+RAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA==';

    const defaultLocks = {
        Street: 1,
        Primary: 1,
        Minor: 2,
        Major: 3,
        Ramp: 4,
        Freeway: 4,
        POI: 1,
        Railroad: 1,
        Private: 1,
        Parking: 1,
        Offroad: 1,
        Narrow: 1,
        Boardwalk: 1,
        Trail: 1,
        Stairway: 1
    };
    const streets = {
        // fake element to show POI's locks
        90000: {
            typeName: "POI",
            scan: true
        },
        // normal streets
        17: {
            typeName: "Private",
            scan: true
        },
        20: {
            typeName: "Parking",
            scan: true
        },
        8: {
            typeName: "Offroad",
            scan: true
        },
        1: {
            typeName: "Street",
            scan: true
        },
        2: {
            typeName: "Primary",
            scan: true
        },
        7: {
            typeName: "Minor",
            scan: true
        },
        6: {
            typeName: "Major",
            scan: true
        },
        4: {
            typeName: "Ramp",
            scan: true
        },
        3: {
            typeName: "Freeway",
            scan: true
        },
        18: {
            typeName: "Railroad",
            scan: true
        },
        22: {
            typeName: "Narrow",
            scan: true
        },
        10: {
            typeName: "Boardwalk",
            scan: true
        },
        5: {
            typeName: "Trail",
            scan: true
        },
        16: {
            typeName: "Stairway",
            scan: true
        }
    };
    let relockObject = {};
    const userlevel = W.loginManager.getUserRank() + 1;
    //const userlevel = 6; // for testing purposes (NOTE: this does not enable you to lock higher!)

    const requestsTimeout = 20000; // in ms
    const rulesHash = "AKfycbzKgUQL7cY6XMBlykq0JzJAPc1B26sKEAnG1RJokA9Wpgf_W0oZJwMKcrhA13LrUbvj";
    let rulesDB = {};

    // Some functions
    function onScreen(obj) {
        if (obj && typeof obj.getOLGeometry === 'function') {
            return (W.map.getOLMap().getExtent().intersectsBounds(obj.getOLGeometry().getBounds()));
        }
        return (false);
    }

    function hasPendingUR(poi) {
        return (poi.attributes.venueUpdateRequests.length > 0);
    }

    function displayHtmlPage(res) {
        if (res.responseText.match(/Authorization needed/) || res.responseText.match(/ServiceLogin/)) {
            alert("LevelReset:\n" +
                "Authorization is required for using this script. This is one time action.\n" +
                "Now you will be redirected to the authorization page, where you'll need to approve request.\n" +
                "After confirmation, please close the page and reload WME.");
        }
        let w = window.open();
        w.document.open();
        w.document.write(res.responseText);
        w.document.close();
        w.location = res.finalUrl;
    }

    function sendHTTPRequest(url, callback) {
        GM_xmlhttpRequest({
            url: url,
            method: 'GET',
            timeout: requestsTimeout,
            onload: function (res) {
                callback(res);
            },
            onreadystatechange: function (res) {
                // fill if needed
            },
            ontimeout: function (res) {
                alert("LevelReset: Sorry, request timeout!");
            },
            onerror: function (res) {
                alert("LevelReset: Sorry, request error!");
            }
        });
    }

    function validateHTTPResponse(res) {
        let result = false,
            displayError = true;
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
                    alert("LevelReset Error: unsupported status code - " + res.status);
                    console.log("LevelReset: " + res.responseHeaders);
                    console.log("LevelReset: " + res.responseText);
                    break;
            }
        } else {
            displayError = false;
            alert("LevelReset error: Response is empty!");
        }

        if (displayError) {
            alert("LevelReset: Error processing request. Response: " + res.responseText);
        }
        return result;
    }

    function getAllLockRules() {
        function requestCallback(res) {
            if (validateHTTPResponse(res)) {
                let out = JSON.parse(res.responseText);
                if (out.result == "success") {
                    initUI(out.rules);
                } else {
                    alert("LevelReset: Error getting locking rules!");
                }
            } else {
                console.warning("LevelReset: can't get locking rules, invalid response!");
            }
        }

        const url = 'https://script.google.com/macros/s/' + rulesHash + '/exec?func=getAllLockRules';
        sendHTTPRequest(url, requestCallback);
    }

    function initUI(rules) {
        let relockContent = document.createElement('div'),
            relockTitle = document.createElement('wz-overline'),
            relockSubTitle = document.createElement('wz-label'),
            rulesSubTitle = document.createElement('wz-label'),
            relockAllbutton = document.createElement('input'),
            relockSub = document.createElement('p'),
            versionTitle = document.createElement('wz-label'),
            resultsCntr = document.createElement('div'),
            rulesCntr = document.createElement('div'),
            alertCntr = document.createElement('div'),
            hidebutton = document.createElement('div'),
            dotscntr = document.createElement('div'),
            inputDiv1 = document.createElement('div'),
            inputDiv2 = document.createElement('div'),
            includeAllSegments = document.createElement('input'),
            includeAllSegmentsLabel = document.createElement('label'),
            respectRouting = document.createElement('input'),
            respectRoutingLabel = document.createElement('label'),
            percentageLoader = document.createElement('div');

        rulesDB = rules;

        // Begin building
        relockTitle.appendChild(document.createTextNode('Re-lock Segments & POI'));

        // fill tab
        relockSub.innerHTML = 'Your on-screen area is automatically scanned when you load or pan around. Pressing the lock behind each type will relock only those results, or you can choose to relock all.<br/><br/>You can only relock segments lower or equal to your current editor level. Segments locked higher than normal are left alone.';
        relockSub.style.cssText = 'font-size:85%;padding:15px;border:1px solid red;border-radius:5px;position:relative';
        relockSub.id = 'sub';
        hidebutton.style.cssText = 'cursor:pointer;width:16px;height:16px;position:absolute;right:3px;top:3px;background-image:url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMTEvMjAvMTVnsXrkAAADTUlEQVQ4jW2TW0xbZQCAv3ODnpYWegEGo1wKwzBcxAs6dONSjGMm3kjmnBqjYqLREE2WLDFTIBmbmmxRpzHy4NPi4zRLfNBlZjjtnCEaOwYDJUDcVqC3UzpWTkt7fp80hvk9f/nePkkIwWb+gA5jMXLQjK50Zc2cuKVp4wlX2UevtAYubnal/waWoTI1N38keu7ck2uTl335ZFJCkpE8XlGob4ibgeZvMl7P8MtdO6/dFohDe/Sn0LdzJ457MuHfUYqLkYtsSIqMJASyIiNv30Gm6+G1zNbqvpf6gqF/AwaUXx+/MDdz6KArH4ujVVRAbgPVroMsQz6P6nJiGUnUGj/pR/tTyx2dtW+11t2UAa5Pz34w//GHLitpsG1wkODp0xQ11GOZJpgmzq5uqo8ew76zAxFPUDJxscwzFR4BkGfh/tj58/3Zq9OoFZU0PHsAd00NnWNj6IEApd3duA48g2nXKenpQSl1oceWsUeuPfdp+M9GZf/zA5+lz3x9lxRbAUli+dIlKnt7Ud1uCk1NJH0+VnMmq6EQfw0NUzCSULBQfT4HVf4iNRO50VlIGSi6jup0sj5zlTO7d9N48iRLa2vkCwWsyTArbx/GAaSBm/MLyLm85OjZs0c2zawQsoRmt5NeXCRyeRLh9rBkGBSEwF6i09h+L96GemyAx2bDK4ENkGRJkbM2fVy4PRhT08RmZvH09VE29C6ixEFuahL3hklLby9PhEKUt7VRZln4kHD669Bqtl6Q7W07jqWL9FQiEkHTdUoGBsgXF5EPh0m8M8Tc62/CSoLSqmqaR4ZxaRpenxfbgw8lCy2Nx5Uv3xuNXEll7shO/HI38Rjr09NImkriyCgOy0JZTZM4+x3C7SY+epTaLZWsdwXJPNV/6jF/9ReSEIKzmcKWpbHPF9OHDxUr6xksoAiQJAmnpuEWAqeq4G9uRr7nPpZeeDG10NqybV+5Ly4DPGJXlsv79u51v38iK22/EwmwACEEIpdD2tjApmncan8A49XX4qtNgeC+cl/8tpm+jxoBY+K3N7I/jj+dvxKuIhZV7KpKWV295dy1K6YEg1/NO2wj+/210f+98R9+hub0wo1BOZnslRVV16orf0hVeD55HH7d7P4N0V1gY9/zcaEAAAAASUVORK5CYII=\');';
        hidebutton.onclick = function () {
            localStorage.msgHide = 1;
            $('#sub').hide('slow');
        };
        dotscntr.style.cssText = 'width:16px;height:16px;margin-left:5px;background:url("' + loader + '");vertical-align:text-top;display:none';
        dotscntr.id = 'dotscntr';
        relockSubTitle.innerHTML = 'Results';
        relockSubTitle.id = 'reshdr';
        rulesSubTitle.innerHTML = 'Active rules';
        versionTitle.innerHTML = 'Version ' + VERSION;
        relockAllbutton.id = 'rlkall';
        relockAllbutton.type = 'button';
        relockAllbutton.value = 'Relock All';
        relockAllbutton.style.cssText = 'margin: 10px 3px 0 0';
        relockAllbutton.onclick = function () {
            relockAll();
        };

        // Also reset higher locked segments?
        includeAllSegments.type = 'checkbox';
        includeAllSegments.name = "name";
        includeAllSegments.value = "value";
        includeAllSegments.checked = (localStorage.getItem('Relock_allSegments') == 'true');
        includeAllSegments.id = "_allSegments";
        includeAllSegments.onclick = function () {
            localStorage.setItem('Relock_allSegments', includeAllSegments.checked.toString());
            scanArea();
            relockShowAlert();
        };
        includeAllSegmentsLabel.htmlFor = "_allSegments";
        includeAllSegmentsLabel.innerHTML = 'Also reset higher locked objects';
        includeAllSegmentsLabel.style.cssText = 'font-size:95%;margin-left:5px;vertical-align:middle';

        // Respect routing road type
        respectRouting.type = 'checkbox';
        respectRouting.name = "name";
        respectRouting.value = "value";
        respectRouting.checked = (localStorage.getItem('Relock_respectRouting') == 'true');
        respectRouting.id = "_respectRouting";
        respectRouting.onclick = function () {
            localStorage.setItem('Relock_respectRouting', respectRouting.checked.toString());
            scanArea();
        };
        respectRoutingLabel.htmlFor = "_respectRouting";
        respectRoutingLabel.innerHTML = 'Respect routing road type';
        respectRoutingLabel.style.cssText = 'font-size:95%;margin-left:5px;vertical-align:middle';

        resultsCntr.style.cssText = 'margin-right:5px;';

        // add results empty list
        $.each(streets, function (key, value) {
            let __cntr = document.createElement('div'),
                __keyLeft = document.createElement('div'),
                __prntRight = document.createElement('div'),
                __cntRight = document.createElement('div'),
                __cleardiv = document.createElement("div"),
                __chkLeft = document.createElement('input'),
                __lblLeft = document.createElement('label');
            let idPrefix = 'Relock_' + value.typeName + '_';

            // Begin building
            __keyLeft.style.cssText = 'float:left';

            __chkLeft.type = 'checkbox';
            __chkLeft.checked = (localStorage.getItem(idPrefix + 'chk') == 'true');
            __chkLeft.id = idPrefix + 'chk';
            __chkLeft.onclick = function () {
                localStorage.setItem(idPrefix + 'chk', __chkLeft.checked.toString());
                scanArea();
            };
            __lblLeft.htmlFor = idPrefix + 'chk';
            __lblLeft.innerHTML = value.typeName;
            __lblLeft.style.cssText = 'margin-bottom:0px;font-weight:normal;';

            __keyLeft.appendChild(__chkLeft);
            __keyLeft.appendChild(__lblLeft);

            __cntRight.style.cssText = 'float:right';
            __cntRight.innerHTML = '-';

            __prntRight.id = idPrefix + 'value';
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

        const topCountry = W.model.getTopCountry();
        const countryRules = rulesDB[topCountry.attributes.abbr];
        if (countryRules) {
            $.each(countryRules, function (key, value) {
                if (key == "CountryName") return false;

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
                $.each(value.Locks, function (k, v) {
                    if (v) {
                        rowElm.className = "tg-row";
                        rowElm.dataset.name = parseInt(key) === 0 ? 'country' : value.CityName; // need to hard code 'country' to identify later
                        if (colIndex < maxCol) {
                            colElm = document.createElement('td');
                            colElm.className = "tg-type";
                            colElm.innerHTML = k;
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
        if (localStorage.msgHide != 1) {
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

        const { tabLabel, tabPane } = W.userscripts.registerSidebarTab("sidepanel-relock");

        tabLabel.innerHTML = 'Re - <span class="fa fa-lock" id="lockcolor" style="color:green"></span>';
        tabLabel.title = "Relock segments";

        tabPane.appendChild(relockContent);
        W.userscripts.waitForElementConnected(tabPane).then(() => {
            // Do a default scan once at startup
            relockShowAlert();
            scanArea();
        });
    }

    function relock(obj, key) {
        let objects = obj[key];
        let _i = 0;

        // update GUI
        function RunLocal() {
            W.model.actionManager.add(objects[_i]);
            _i++;

            if (_i < objects.length) {
                setTimeout(RunLocal, 1);
                let newWidth = (_i / objects.length) * $('#sidepanel-relockTab').css('width').replace('px', '');
                $('#percentageLoader').show();
                $('#percentageLoader').css('width', newWidth + 'px');
                $('#dotscntr').css('display', 'inline-block');
            } else {
                $('#dotscntr').css('display', 'none');
                $('#percentageLoader').hide();
            }
        }
        RunLocal();
    }

    function relockAll() {
        // only lock "all" until the current editors level is reached, then stop...
        $('#dotscntr').css('display', 'inline-block');

        $.each(relockObject, function (key, value) {
            if (value.length !== 0) {
                // loop trough each segmentType
                let _i = 0;
                let RunLocal5 = function () {
                    W.model.actionManager.add(value[_i]);
                    _i++;

                    // Did not iterate with $.each, so the GUI can update with larger arrays
                    if (_i < value.length) {
                        setTimeout(RunLocal5, 1);
                        let newWidth = (_i / value.length) * $('#sidepanel-relockTab').css('width').replace('px', '');
                        $('#percentageLoader').show();
                        $('#percentageLoader').css('width', newWidth + 'px');
                        $('#dotscntr').css('display', 'inline-block');
                    } else {
                        $('#dotscntr').css('display', 'none');
                        $('#percentageLoader').hide();
                    }
                };
                RunLocal5();
            }
        });
        scanArea();
        $('#dotscntr').hide('slow');
    }

    function relockShowAlert() {
        let includeAllSegments = document.getElementById('_allSegments');
        if (includeAllSegments && includeAllSegments.checked)
            $('#alertCntr').show("fast");
        else
            $('#alertCntr').hide("fast");
    }

    function hideInactiveCities() {
        $('tr.tg-row').each(function (i) {
            let isActive = false;
            for (let j in W.model.cities.objects) {
                if (W.model.cities.objects[j].attributes.name == $(this).data("name")) {
                    isActive = true;
                    break;
                }
            }
            if (isActive || $(this).data("name") == 'country') {
                $(this).show("fast");
            } else {
                $(this).hide("fast");
            }
        });
    }

    function setLockLevel(v, scanObj, desiredLockLevel) {
        let includeAllSegments = document.getElementById('_allSegments');
        let allSegmentsInclude = includeAllSegments.checked && userlevel > 4;
        if (userlevel > desiredLockLevel) {
            if ((v.attributes.lockRank < desiredLockLevel) ||
                (v.attributes.lockRank > desiredLockLevel && allSegmentsInclude)) {
                relockObject[scanObj].push(new UpdateObject(v, {
                    lockRank: desiredLockLevel
                }));
                return true;
            }
        }
        return false;
    }

    function scanArea() {
        let respectRouting = document.getElementById('_respectRouting');
        let relockSubTitle = document.getElementById('reshdr');
        let relockAllbutton = document.getElementById('rlkall');

        if (!(relockSubTitle && relockAllbutton && respectRouting))
            return;

        hideInactiveCities();

        // Object with array of road types, to collect each wrongly locked segment, for later use
        $.each(defaultLocks, function (k, v) {
            relockObject[k] = [];
        });

        let foundBadlocks = false;
        let respectRoutingRoadType = respectRouting.checked;
        let count = 0;

        // Choose country lock settings. If country selection fails
        // or country isn't in this list, WME default values are used.
        let topCountry = W.model.getTopCountry();
        let ABBR = rulesDB[topCountry.attributes.abbr] ? rulesDB[topCountry.attributes.abbr][0].Locks : defaultLocks;
        console.log("LevelReset: ", ABBR);

        // Do a count on how many segments are in need of a correct lock (limit to 150 to save CPU)
        // Count also depends on the users editor level
        const limitCount = 150;
        relockSubTitle.innerHTML = 'Results (limit: ' + limitCount + ')';

        // disable unchecked road types
        $.each(streets, function (key, value) {
            let idPrefix = 'Relock_' + value.typeName + '_chk';
            let chk = document.getElementById(idPrefix);
            value.scan = (chk && chk.checked);
        });

        // ============== POI ===========================
        if (streets["90000"].scan) {
            let scanObj = "POI";
            $.each(W.model.venues.objects, function (k, v) {
                if (count < limitCount && v.type == "venue" && onScreen(v) && v.isGeometryEditable() && !hasPendingUR(v) /*&& !v.isResidential()*/) {

                    let strt = v.attributes.streetID ? W.model.streets.objects[v.attributes.streetID] : null;
                    let cityID = strt ? strt.cityID : null;

                    let desiredLockLevel = (cityID && rulesDB[topCountry.attributes.abbr] && rulesDB[topCountry.attributes.abbr][cityID]) ? rulesDB[topCountry.attributes.abbr][cityID].Locks[scanObj] : ABBR[scanObj];
                    desiredLockLevel--;

                    if (setLockLevel(v, scanObj, desiredLockLevel)) {
                        foundBadlocks = true;
                        count++;
                    }
                }
            });
        }
        /*
        // ============== Cameras ===========================
        if (streets["90001"].scan) {
            let scanObj = "Camera";
            $.each(W.model.cameras.objects, function (k, v) {
                if (count < limitCount && v.type == "camera" && onScreen(v) && v.isGeometryEditable()) {

                    let desiredLockLevel = ABBR[scanObj];
                    desiredLockLevel--;

                    if (setLockLevel(v, scanObj, desiredLockLevel)) {
                        foundBadlocks = true;
                        count++;
                    }
                }
            });
        }
        // ============== Railroad Crossings ===========================
        if (streets["90002"].scan) {
            let scanObj = "RailroadCrossing";
            $.each(W.model.railroadCrossings.objects, function (k, v) {
                if (count < limitCount && v.type == "railroadCrossing" && onScreen(v) && v.isGeometryEditable()) {

                    let desiredLockLevel = ABBR[scanObj];
                    desiredLockLevel--;

                    if (setLockLevel(v, scanObj, desiredLockLevel)) {
                        foundBadlocks = true;
                        count++;
                    }
                }
            });
        }
        */
        // ============== Segments ===========================
        $.each(W.model.segments.objects, function (k, v) {
            if (count < limitCount && v.type == "segment" && onScreen(v) && v.isGeometryEditable()) {
                let curStreet = streets[v.attributes.roadType];
                // for changed routing respect the routing type (if enabled)
                if (v.attributes.routingRoadType && respectRoutingRoadType) {
                    curStreet = streets[v.attributes.routingRoadType];
                }
                if (curStreet && curStreet.scan) {
                    let strt = W.model.streets.getObjectById(v.attributes.primaryStreetID);
                    let cityID = strt ? strt.attributes.cityID : null;

                    let stLocks = (cityID && rulesDB[topCountry.attributes.abbr] && rulesDB[topCountry.attributes.abbr][cityID]) ? rulesDB[topCountry.attributes.abbr][cityID].Locks : ABBR;
                    let desiredLockLevel = stLocks[curStreet.typeName] - 1;

                    if (setLockLevel(v, curStreet.typeName, desiredLockLevel)) {
                        foundBadlocks = true;
                        count++;
                    }
                }
            }
        });

        // Build results to users tab panel
        $.each(relockObject, function (key, value) {
            let __lckRight = document.createElement('div');
            let __cntRight = document.createElement('div');
            let idPrefix = 'Relock_' + key + '_value';

            // Begin building
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
                __cntRight.innerHTML = '-';
            }

            __prntRight.appendChild(__cntRight);
        });

        // Color the small lock icon red, if errors are found, so people can decide what to do...
        if (foundBadlocks) {
            relockAllbutton.removeAttribute('disabled');
            $('#lockcolor').css('color', 'red');
        } else {
            relockAllbutton.setAttribute('disabled', true);
            $('#lockcolor').css('color', 'green');
        }
    }

    getAllLockRules();

    // Register some event listeners
    W.map.events.register("moveend", null, scanArea);
    W.model.actionManager.events.register("afteraction", null, scanArea);
    W.model.actionManager.events.register("afterundoaction", null, scanArea);
    W.model.actionManager.events.register("noActions", null, scanArea);
}

LevelReset_bootstrap();
