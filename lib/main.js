/**
 * main.js
 */

var { ToggleButton } = require('sdk/ui/button/toggle');
var { Panel } = require('sdk/panel');
var self = require('sdk/self');
var tabs = require('sdk/tabs');
var { getMostRecentBrowserWindow } = require("sdk/window/utils");
var { getBrowserForTab } = require("sdk/tabs/utils");
var { Bookmark, Group, save, search, UNSORTED } = require("sdk/places/bookmarks");
var ss = require("sdk/simple-storage");

// var _ = require("./bower_components/underscore/underscore-min.js");

// TODO: keep a history of tabs
var dequeued = [];

tabs.open("http://www.example.com");
// tabs[0].activate();


// Tab Queue

var queue = [];
var enqueued = [];
var selectedTab = [];

var button = ToggleButton({
    id: "tab-queue",
    label: "Tab Queue",
    icon: {
        "16": "./icon-16.png",
        "32": "./icon-32.png",
        "64": "./icon-64.png"
    },
    onChange: handleChange
});

// TODO: refactor to use css cursor property
var panel = Panel({
    contentURL: self.data.url("panel.html"),
    contentScriptFile: self.data.url("panel.js"),
    onShow: handleShow,
    onHide: handleHide
});

// TODO: add hotkeys (sdk)
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
    for each (var tab in enqueued) {
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

function openTab(url, activate) {
    // console.log("Opening tab: ",url);
    var done = false;
    for each (var tab in tabs) {
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
        tabs.open(url);
    }
}

panel.port.emit("activate-opening");

panel.port.on("open-clicked", function() {
    for each (var tab in queue) {
        openTab(tab[1], false);
    }
});

panel.port.emit("activate-bookmarking");

panel.port.on("bookmark-clicked", function() {
    // console.log("Saving bookmarks");
    var bookmarks = [];
    for each (var tab in queue) {
        bookmarks.push(Bookmark({ title: tab[0], url: tab[1], group: UNSORTED }));
    }
    save(bookmarks).on("end", function() {
        console.log("Done.");
    });
});

panel.port.on("hide", function() {
    panel.hide();
});

panel.port.on("item-clicked", function(url) {
    // console.log("Entry clicked: ", url);
    openTab(url, true);
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

var wmButton = ToggleButton({
    id: "window-manager",
    label: "Window Manager",
    icon: {
        "16": "./icon-16.png",
        "32": "./icon-32.png",
        "64": "./icon-64.png"
    },
    onChange: wmHandleChange
});

var wmPanel = Panel({
    contentURL: self.data.url("wmPanel.html"),
    contentScriptFile: self.data.url("wmPanel.js"),
    onShow: wmHandleShow,
    onHide: wmHandleHide
});

function wmHandleChange(state) {
    if (state.checked) {
        wmPanel.show({
            position: wmButton
        });
    }
}

function wmHandleShow() {
    if (firstShow) {
        for each (var win in ss.storage.windows) {
            wmPanel.port.emit("show", win);
        }
        firstShow = false;
    }
    else {
        for each (var win in added) {
            wmPanel.port.emit("show", win);
            ss.storage.windows.push(win);
        }
    }
}

function wmHandleHide() {
    wmButton.state('window', {checked: false});
}


// Utility functions

function containsArray(bigArray, smallArray) {
    for each (var item in bigArray) {
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
