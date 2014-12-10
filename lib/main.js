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

// TODO: keep a history of tabs
var dequeued = [];

allTabs.open("http://www.example.com");
// allTabs[0].activate();


// Tab Queue

var queue = [];
var enqueued = [];
var selectedTab = [];

var button = ToggleButton({
    id: "tab-queue",
    label: "Tab Queue",
    icon: {
        "16": "./img/icon-16.png",
        "32": "./img/icon-32.png",
        "64": "./img/icon-64.png"
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
    // console.log("Called enqueueTab");
    if (!containsArray(enqueued, selectedTab)) {
        // console.log("Adding: ", selectedTab[0]);
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

function handleShow(state) {
    // console.log("Queue size: ", queue.length);
    for (let tab of enqueued) {
        if (!containsArray(queue, tab)) {
            // console.log("Not yet in queue: ", tab[0]);
            panel.port.emit("show", tab);
            queue.push(tab);
        }
    }
    // console.log("Queue size: ", queue.length);
    enqueued = [];
}

function handleHide(state) {
    // console.log("Done.");
    button.state('window', {checked: false});
}

function openOrActivateTab(url, activate) {
    // console.log("Opening tab: ",url);
    var done = false;
    for (let tab of allTabs) {
        if (tab.url == url) {
            // console.log("Found tab.");
            if (activate == true) {
                tab.activate();
            }
            done = true;
            break;
        }
    }
    if (done == false) {
        allTabs.open(url);
    }
}

panel.port.on("open-clicked", function() {
    for (let tab of queue) {
        openOrActivateTab(tab[1], false);
    }
});

panel.port.on("bookmark-clicked", function() {
    // console.log("Saving bookmarks");
    var bookmarks = [];
    for (let tab of queue) {
        bookmarks.push(Bookmark({ title: tab[0], url: tab[1], group: UNSORTED }));
    }
    save(bookmarks).on("end", function() {
        // console.log("Done.");
    });
});

panel.port.on("item-clicked", function(url) {
    // console.log("Entry clicked: ", url);
    openOrActivateTab(url, true);
    panel.hide();
});

panel.port.on("dequeue-clicked", function(url) {
    for (var i=0; i<queue.length; i++) {
        if (queue[i][1] == url) {
            queue.splice(i, 1);
            break;
        }
    }
});


// Window Manager

var added = [];
var firstShow = true;

if (!ss.storage.windows) {
    ss.storage.windows = [];
}

ss.storage.windows[0] = ["Test", [["tab1", "http://www.patrick--ryan.com"], ["tab2", "http://www.example.com"]]];

var wmButton = ToggleButton({
    id: "window-manager",
    label: "Window Manager",
    icon: {
        "16": "./img/icon-16.png",
        "32": "./img/icon-32.png",
        "64": "./img/icon-64.png"
    },
    onChange: wmHandleChange
});

var wmPanel = Panel({
    contentURL: self.data.url("wmPanel.html"),
    contentScriptFile: self.data.url("wmPanel.js"),
    onShow: wmHandleShow,
    onHide: wmHandleHide,
    height: 300,
    width: 400
});

wmPanel.port.emit("activate");

function wmHandleChange(state) {
    if (state.checked) {
        wmPanel.show({
            position: wmButton
        });
    }
}

function wmHandleShow() {
    if (firstShow) {
        for (let win of ss.storage.windows) {
            wmPanel.port.emit("show", win);
        }
        firstShow = false;
    }
    else {
        for (let win of added) {
            wmPanel.port.emit("show", win);
            ss.storage.windows.push(win);
        }
        added = [];
    }
    wmPanel.port.emit("handle-warnings");
}

function wmHandleHide() {
    wmButton.state('window', {checked: false});
}

// TODO: verify accuracy of quota usage percentage; calculate space needed by current window
wmPanel.port.on("save-clicked", function() {
    if (ss.quotaUsage < 0.9) {
        wmPanel.port.emit("enough-space", true);
    }
    else {
        wmPanel.port.emit("enough-space", false);
    }
});

// TODO: consider using windows.activeWindow.tabs instead
wmPanel.port.on("title-entered", function(title) {
    var tabs = getMostRecentBrowserWindow().gBrowser.tabs;
    var tabList = [];
    for (let tab of tabs) {
        tabList.push([tab.label,getBrowserForTab(tab).contentDocument.location.href]);
    }
    var win = [title,tabList];
    ss.storage.windows.push(win);
    wmPanel.port.emit("add", win);
});

ss.on("overQuota", function() { console.log("OVER QUOTA BY ", ss.quotaUsage, "%!")});

wmPanel.port.on("remove-clicked", function(title) {
    var wins = ss.storage.windows;
    for (var i=0; i<wins.length; i++) {
        if (wins[i][0] == title) {
            ss.storage.windows.splice(i, 1);
            break;
        }
    }
});

wmPanel.port.on("open-clicked", function(tabs) {
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
});


// Utility functions

function containsArray(bigArray, smallArray) {
    for (let item of bigArray) {
        var contains = true;
        for (var i=0; i<smallArray.length; i++) {
            // console.log("Value 1: ", item[i]);
            // console.log("Value 2: ", smallArray[i]);
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
