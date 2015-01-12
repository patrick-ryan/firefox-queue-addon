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

var SAVING = false;

var ADDED = [];
var FIRST_SHOW = true;


// Test

// allTabs.open("http://www.example.com");
// allTabs[0].activate();


// Tab Queue

var queue = [];
var enqueued = [];
var selectedTab = [];

// TODO: keep a history of tabs
// var dequeued = [];

var button = ToggleButton({
    id: "tab-queue",
    label: "Tab Queue",
    icon: {
        "16": "./img/tabicon16.png",
        "32": "./img/tabicon32.png",
        "64": "./img/tabicon64.png"
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
    for (let tab of enqueued) {
        if (!containsArray(queue, tab)) {
            panel.port.emit("show", tab);
            queue.push(tab);
        }
    }
    enqueued = [];
    panel.port.emit("handle-warnings");
}

function handleHide(state) {
    button.state('window', {checked: false});

    if (SAVING) {
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
    openOrActivateTabs(tabs, false, false);
});

panel.port.on("save-clicked", function() {
    SAVING = true;
    panel.port.emit("enough-space", enoughSpace());
});

// TODO: add cancel button
panel.port.on("title-entered", function(win) {
    SAVING = false;
    if (FIRST_SHOW) {
        ss.storage.windows.push(win);
    }
    else {
        ADDED.push(win);
    }
    wPanel.show({
        position: wButton
    });
});

panel.port.on("remove-clicked", function(url) {
    for (var i=0; i<queue.length; i++) {
        if (queue[i][1] == url) {
            queue.splice(i, 1);
            break;
        }
    }
});


// Window Queue

if (!ss.storage.windows) {
    ss.storage.windows = [];
}

// ss.storage.windows[0] = ["Test", [["tab1", "http://www.patrick--ryan.com"], ["tab2", "http://www.example.com"]]];

var wButton = ToggleButton({
    id: "window-queue",
    label: "Window Queue",
    icon: {
        "16": "./img/windowicon16.png",
        "32": "./img/windowicon32.png",
        "64": "./img/windowicon64.png"
    },
    onChange: wHandleChange
});

var wPanel = Panel({
    contentURL: self.data.url("wPanel.html"),
    contentScriptFile: self.data.url("wPanel.js"),
    onShow: wHandleShow,
    onHide: wHandleHide,
    height: 300,
    width: 400
});

wPanel.port.emit("activate");

function wHandleChange(state) {
    if (state.checked) {
        wPanel.show({
            position: wButton
        });
    }
}

function wHandleShow() {
    if (FIRST_SHOW) {
        for (let win of ss.storage.windows) {
            wPanel.port.emit("show", win);
        }
        FIRST_SHOW = false;
    }
    else {
        for (let win of ADDED) {
            wPanel.port.emit("show", win);
            ss.storage.windows.push(win);
        }
        ADDED = [];
    }
    wPanel.port.emit("handle-warnings");
}

function wHandleHide() {
    wButton.state('window', {checked: false});
}

wPanel.port.on("open-clicked", function(data) {
    openOrActivateTabs(data[1], false, data[0]);
});

wPanel.port.on("save-clicked", function() {
    wPanel.port.emit("enough-space", enoughSpace());
});

// TODO: add cancel button
// TODO: if panel hides, then cancel
wPanel.port.on("title-entered", function(title) {
    // if activeWindow is deprecated at some point, instead use 
    // getMostRecentBrowserWindow().gBrowser.tabs; which uses a 
    // NodeList of <tab.tabbrowser-tab> instances
    var tabs = allWindows.activeWindow.tabs;
    var tabList = [];
    for (let tab of tabs) {
        // tabList.push([tab.label,getBrowserForTab(tab).contentDocument.location.href]);
        tabList.push([tab.title,tab.url]);
    }
    var win = [title,tabList];
    ss.storage.windows.push(win);
    wPanel.port.emit("add", win);
});

ss.on("overQuota", function() { console.log("OVER QUOTA BY ", ss.quotaUsage, "%!")});

wPanel.port.on("export-clicked", function() {
    // TODO
});

wPanel.port.on("remove-clicked", function(title) {
    var wins = ss.storage.windows;
    for (var i=0; i<wins.length; i++) {
        if (wins[i][0] == title) {
            ss.storage.windows.splice(i, 1);
            break;
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