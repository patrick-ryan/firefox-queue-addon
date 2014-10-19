/**
 * main.js
 */

var buttons = require('sdk/ui/button/toggle');
var panels = require('sdk/panel');
var self = require('sdk/self');
var tabs = require('sdk/tabs');
var utils = require("sdk/window/utils");
var tabsUtils = require("sdk/tabs/utils");
var { Bookmark, Group, save, search, UNSORTED } = require("sdk/places/bookmarks");

// might not need this anymore
// var _ = require("./bower_components/underscore/underscore-min.js");

var queue = [];
var enqueued = [];
var selectedTab = [];

// TODO: keep a history of tabs
var dequeued = [];

tabs.open("http://www.example.com");
// tabs[0].activate();

var button = buttons.ToggleButton({
    id: "queue",
    label: "Queue",
    icon: {
        "16": "./icon-16.png",
        "32": "./icon-32.png",
        "64": "./icon-64.png"
    },
    onChange: handleChange
});

var panel = panels.Panel({
    contentURL: self.data.url("panel.html"),
    contentScriptFile: self.data.url("panel.js"),
    onShow: handleShow,
    onHide: handleHide
});

// TODO: evaluate context menus for panel context
var XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
var window = utils.getMostRecentBrowserWindow();
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
    selectedTab[1] = tabsUtils.getBrowserForTab(event.target).contentDocument.location.href;
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
    var done = false;
    for each (var tab in tabs) {
        if (tab.url == url) {
            tab.activate();
            done = true;
            break;
        }
    }
    if (done == false) {
        tabs.open(url);
    }
});

panel.port.on("dequeue-clicked", function(url) {
    for (var i=0; i<queue.length; i++) {
        if (queue[i].url == url) {
            queue.splice(i, 1);
        }
    }
});

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
