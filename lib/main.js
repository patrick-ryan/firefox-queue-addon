/**
 * main.js
 */

// var buttons = require('sdk/ui/button/action');
var buttons = require('sdk/ui/button/toggle');
var panels = require('sdk/panel');
var self = require('sdk/self');
var tabs = require('sdk/tabs');
var cm = require("sdk/context-menu");
var queue = [];
var _ = require("../bower_components/underscore/underscore-min.js");

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

var item = cm.Item({
    label: "Enqueue",
    // context: cm.SelectorContext("a"),
    context: cm.PageContext(),
    contentScriptFile: self.data.url("context-menu.js")
});

function handleChange(state) {
    if (state.checked) {
        panel.show({
            position: button
        });
    }
}

function handleShow(state) {
    for each (var tab in tabs) {
        console.log(tab.id);
        if (_.contains(queue, tab.id)) {
            panel.port.emit("show", [tab.title, tab.url]);
        }
    }
    panel.port.emit("end");
}

panel.port.on("new-tab", function(url) {
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

panel.port.on("hide", function() {
    panel.hide();
});

function handleHide(state) {
    console.log("Done.");
    button.state('window', {checked: false});
}
