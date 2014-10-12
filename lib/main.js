/**
 * main.js
 */

// var buttons = require('sdk/ui/button/action');
var buttons = require('sdk/ui/button/toggle');
var panels = require('sdk/panel');
var self = require('sdk/self');
var tabs = require('sdk/tabs');
// var cm = require("sdk/context-menu");
var utils = require("sdk/window/utils");
// var { modelFor } = require("sdk/model/core");
var tabs_utils = require("sdk/tabs/utils");

var _ = require("./bower_components/underscore/underscore-min.js");

var queue = [tabs[0]]; // ["-3-1"];
var selected_tab = [];

var opened = false;
var closed = false;

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
    contentScriptFile: self.data.url("display-tabs.js"),
    onShow: handleShow,
    onHide: handleHide,
    contextMenu: true
});

// var item = cm.Item({
//     label: "Enqueue",
//     // context: cm.SelectorContext("a"),
//     // context: cm.PageContext(),
//     contentScriptFile: self.data.url("context-menu.js")
// });

var window = utils.getMostRecentBrowserWindow();
var menu = window.document.getElementById("tabContextMenu");
var enqueue = window.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","menuitem");
enqueue.setAttribute("id", "contexttab-enqueue");
enqueue.setAttribute("label", "Enqueue tab");
enqueue.addEventListener("command", enqueueTab(selected_tab));
menu.insertBefore(enqueue, menu.firstChild);
window.oncontextmenu = function(event) {
    selected_tab[0] = event.target.label;
    selected_tab[1] = tabs_utils.getBrowserForTab(event.target).contentDocument.location.href;
    // var tab = modelFor(event.target);
}

function enqueueTab(tab) {
    queue.push(tab);
}

function handleChange(state) {
    if (state.checked) {
        panel.show({
            position: button
        });
    }
}

function handleShow(state) {
    panel.port.emit("scratch");
    for each (var tab in queue) {
        panel.port.emit("show", tab);
    }
    panel.port.emit("end");
}

panel.port.on("entry-clicked", function(url) {
    var done = false;
    for each (var tab in tabs) {
        if (tab.url = url) {
            // tab.activate();
            // done = true;
        }
    }
    if (done == false) {
        tabs.open(url);
    }
});

// tabs.on("open", function(tab) {
//     queue.push(tab);
//     opened = true;
// });

// tabs.on("close", function(tab) {
//     console.log("Tab closed");
//     queue = _.without(queue, tab);
//     closed = true;
// });

panel.port.on("hide", function() {
    panel.hide();
});

function handleHide(state) {
    console.log("Done.");
    button.state('window', {checked: false});
}
