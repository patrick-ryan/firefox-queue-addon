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
var ENV = "tab"; // "win";
var QUEUE = [];
var ENQUEUED = [];
var FIRST = true;

// TODO: keep a history of tabs
// var DEQUEUED = [];


// Test

// allTabs.open("http://www.example.com");
// allTabs[0].activate();


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
    height: 400,
    width: 550
});

panel.port.emit("activate");
activateContextMenu(getMostRecentBrowserWindow());
allWindows.on("open", function(browserWindow) {
    activateContextMenu(viewFor(browserWindow));
});

// TODO: add hotkeys (sdk)
// TODO: support other node names (e.g. <A> links)
function activateContextMenu(window) {
    var XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    var menu = window.document.getElementById("tabContextMenu");
    var separator = window.document.createElementNS(XUL_NS, "menuseparator");
    menu.insertBefore(separator, menu.firstChild);
    var enqueue = window.document.createElementNS(XUL_NS, "menuitem");
    enqueue.setAttribute("id", "contexttab-enqueue");
    enqueue.setAttribute("label", "Enqueue tab");
    var tab;
    enqueue.addEventListener("command", function(event) {
        if (!containsArray(ENQUEUED, tab)) {
            ENQUEUED.push(tab);
        }
    });
    menu.insertBefore(enqueue, menu.firstChild);
    window.oncontextmenu = function(event) {
        if (event.target.nodeName == "tab") {
            tab = [event.target.label, getBrowserForTab(event.target).contentDocument.location.href];
        }
    }
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
    showEnv();
}

function showEnv() {
    panel.port.emit("handle-warnings");
    if (ENV == "tab") {
        for (let tab of ENQUEUED) {
            if (!containsArray(QUEUE, tab)) {
                panel.port.emit("show-tab", tab);
                QUEUE.push(tab);
            }
        }
        ENQUEUED = [];
    }
    else {
        if (FIRST) {
            for (let win of ss.storage.windows) {
                panel.port.emit("show-win", win);
            }
        }
        FIRST = false;
    }
}

function handleHide(state) {
    button.state('window', {checked: false});

    if (SAVING) {
        panel.port.emit("save-cancelled");
    }
}

panel.port.on("switch-env", function(newEnv) {
    ENV = newEnv;
    showEnv();
});

panel.port.on("bookmark-clicked", function(tabs) {
    var bookmarks = [];
    for (let tab of tabs) {
        bookmarks.push(Bookmark({ title: tab[0], url: tab[1], group: UNSORTED }));
    }
    save(bookmarks).on("end", function() {
        // console.log("Done.");
    });
});

panel.port.on("open-clicked", function(data) {
    openOrActivateTabs(data[1], false, data[0]);
});

// TODO: add cancel button
// TODO: if panel hides, then cancel
panel.port.on("save-clicked", function() {
    SAVING = true;
    if (enoughSpace()) {
        var tabList = [];
        if (ENV == "win") {
            // if activeWindow is deprecated at some point, instead use 
            // getMostRecentBrowserWindow().gBrowser.tabs; which uses a 
            // NodeList of <tab.tabbrowser-tab> instances
            var tabs = allWindows.activeWindow.tabs;
            for (let tab of tabs) {
                // tabList.push([tab.label,getBrowserForTab(tab).contentDocument.location.href]);
                tabList.push([tab.title,tab.url]);
            }
        }
        panel.port.emit("save-win", tabList);
    }
    else {
        panel.port.emit("save-win", false);
    }
    ENV = "win";
});

panel.port.on("title-entered", function(win) {
    ss.storage.windows.push(win);
    SAVING = false;
});

ss.on("overQuota", function() { console.log("OVER QUOTA BY ", ss.quotaUsage, "%!")});

panel.port.on("export-clicked", function() {
    // TODO
});

panel.port.on("remove-tab-clicked", function(url) {
    for (var i=0; i<QUEUE.length; i++) {
        if (QUEUE[i][1] == url) {
            QUEUE.splice(i, 1);
            break;
        }
    }
});

panel.port.on("remove-win-clicked", function(title) {
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