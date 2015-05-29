/**
 * main.js
 */

var { ToggleButton } = require('sdk/ui/button/toggle');
var { Panel } = require('sdk/panel');
var self = require('sdk/self');
var allTabs = require('sdk/tabs');
var { getMostRecentBrowserWindow } = require("sdk/window/utils");
var { getBrowserForTab, openTab } = require("sdk/tabs/utils");
var { Bookmark, Group, save, search, UNSORTED } = require("sdk/places/bookmarks");
var ss = require("sdk/simple-storage");
var allWindows = require("sdk/windows").browserWindows;
var { viewFor } = require("sdk/view/core");

// var _ = require("./bower_components/underscore/underscore-min.js");

var TSAVING = false;
var WSAVING = false;
var ADDED = [];
var FIRST_SHOW = true;
var ENV = "tab"; // "window";


// Test

// allTabs.open("http://www.example.com");
// allTabs[0].activate();


// Tab Queue

var queue = [];
var enqueued = [];
var selectedTab = [];

// TODO: keep a history of tabs
// var dequeued = [];

if (!ss.storage.windows) {
    ss.storage.windows = [];
}

var button = ToggleButton({
    id: "tab-store",
    label: "Tab Store",
    icon: {
        "16": "./img/windowicon16.png",
        "32": "./img/windowicon32.png",
        "64": "./img/windowicon64.png"
    },
    onChange: handleChange
});

var panel = Panel({
    contentURL: self.data.url("panel.html"),
    contentScriptFile: self.data.url("panel.js"),
    onShow: handleShow,
    onHide: handleHide,
    height: 300,
    width: 400
});

panel.port.emit("activate");
activateContextMenu();

// TODO: add hotkeys (sdk)
function activateContextMenu() {
    var XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    var window = getMostRecentBrowserWindow();
    var menu = window.document.getElementById("tabContextMenu");
    var separator = window.document.createElementNS(XUL_NS, "menuseparator");
    menu.insertBefore(separator, menu.firstChild);
    var enqueue = window.document.createElementNS(XUL_NS, "menuitem");
    enqueue.setAttribute("id", "contexttab-enqueue");
    enqueue.setAttribute("label", "Enqueue tab");
    enqueue.addEventListener("command", enqueueTab);
    menu.insertBefore(enqueue, menu.firstChild);
    window.oncontextmenu = function(event) {
        selectedTab[0] = event.target.label;
        selectedTab[1] = getBrowserForTab(event.target).contentDocument.location.href;
    }
}

function enqueueTab() {
    if (!containsArray(enqueued, selectedTab)) {
        enqueued.push(selectedTab);
    }
    selectedTab = [];
}

function handleChange(state) {
    if (state.checked) {
        panel.show({
            position: button
        });
    }
}

// TODO: add clear button
function handleShow(state) {
    if (ENV == "tab") {
        for (let tab of enqueued) {
            if (!containsArray(queue, tab)) {
                panel.port.emit("show-tab", tab);
                queue.push(tab);
            }
        }
        enqueued = [];
    }
    else {
        if (FIRST_SHOW) {
            for (let win of ss.storage.windows) {
                panel.port.emit("show-win", win);
            }
            FIRST_SHOW = false;
        }
        else {
            for (let win of ADDED) {
                panel.port.emit("show-win", win);
                ss.storage.windows.push(win);
            }
            ADDED = [];
        }
    }
    panel.port.emit("handle-warnings");
}

function handleHide(state) {
    button.state('window', {checked: false});

    if (TSAVING || WSAVING) {
        panel.port.emit("save-cancelled");
    }
}

panel.port.on("bookmark-clicked", function(tabs) {
    var bookmarks = [];
    for (let tab of tabs) {
        bookmarks.push(Bookmark({ title: tab[0], url: tab[1], group: UNSORTED }));
    }
    save(bookmarks).on("end", function() {
        // console.log("Done.");
    });
});

panel.port.on("open-clicked", function(tabs) {
    openOrActivateTabs(data[1], false, data[0]);
});

panel.port.on("save-clicked", function() {
    if (ENV == "tab") {
        TSAVING = true;
    }
    else {
        WSAVING = true;
    }
    panel.port.emit("enough-space", enoughSpace());
});

// TODO: add cancel button
// TODO: if panel hides, then cancel
panel.port.on("title-entered", function(win) {
    if (ENV == "tab") {
        TSAVING = false;
        if (FIRST_SHOW) {
            ss.storage.windows.push(win);
        }
        else {
            ADDED.push(win);
        }
        // FIX
        panel.show({
            position: wButton
        });
    }
    else {
        // if activeWindow is deprecated at some point, instead use 
        // getMostRecentBrowserWindow().gBrowser.tabs; which uses a 
        // NodeList of <tab.tabbrowser-tab> instances
        WSAVING = false;
        var tabs = allWindows.activeWindow.tabs;
        var tabList = [];
        for (let tab of tabs) {
            // tabList.push([tab.label,getBrowserForTab(tab).contentDocument.location.href]);
            tabList.push([tab.title,tab.url]);
        }
        var win = [title,tabList];
        ss.storage.windows.push(win);
        panel.port.emit("add", win);
    }
});

ss.on("overQuota", function() { console.log("OVER QUOTA BY ", ss.quotaUsage, "%!")});

panel.port.on("export-clicked", function() {
    // TODO
});

// FIX
panel.port.on("remove-clicked", function(url) {
    if (ENV == "tab") {
        for (var i=0; i<queue.length; i++) {
            if (queue[i][1] == url) {
                queue.splice(i, 1);
                break;
            }
        }
    }
    else {
        var wins = ss.storage.windows;
        for (var i=0; i<wins.length; i++) {
            if (wins[i][0] == title) {
                ss.storage.windows.splice(i, 1);
                break;
            }
        }
    }
});


// Utility functions

function containsArray(bigArray, smallArray) {
    for (let item of bigArray) {
        var contains = true;
        for (var i=0; i<smallArray.length; i++) {
            if (item[i] != smallArray[i]) {
                contains = false;
                break;
            }
        }
        if (contains == true) {
            return true;
        }
    }
    return false;
}

// TODO: verify accuracy of quota usage percentage
// TODO: calculate space needed by current window
function enoughSpace() {
    if (ss.quotaUsage < 0.9) {
        return true;
    }
    return false;
}

function openOrActivateTabs(tabs, activate, newWindow) {
    if (tabs.length > 0) {
        if (newWindow) {
            openInWindow(tabs);
            return;
        }
        // TODO: only activate tabs on the active window
        for (let tab of tabs) {
            var url = tab[1];
            var done = false;
            if (activate == true) {
                for (let currentTab of allTabs) {
                    if (currentTab.url == url) {
                        currentTab.activate();
                        done = true;
                        break;
                    }
                }
            }
            if (done == false) {
                allTabs.open(url);
            }
        }
    }
}

// openTab ensures that tabs are opened in the new window,
// rather than in the active window
function openInWindow(tabs) {
    allWindows.open({
        url: tabs[0][1],
        onOpen: function(win) {
            var domWin = viewFor(win);
            win.tabs[0].on("ready", function() {
                for (var i=1; i<tabs.length; i++) {
                    openTab(domWin, tabs[i][1]);
                }
            });
        }
    });
}