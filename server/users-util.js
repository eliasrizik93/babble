/*jslint this, node: true */
"use strict";

var gravatar = require("./gravatar-util");
var messages = require("./messages-util");

var Users = {

    userArray: [],
    messageClients: [],
    statsClients: [],

    login: function (username, useremail) {
        var user = {
            id: this.guid(),
            name: username,
            email: useremail
        };
        user.avatar = gravatar.getimageUrl(useremail);

        this.userArray.push(user);
        return user.id;
    },

    getUserById: function (userId) {
        return this.userArray.find(function (user) {
            return user.id === userId;
        });
    },

    logout: function (id) {
        this.userArray = this.userArray.filter(function (user) {
            return user.id === id;
        });
    },

    isLoggedIn: function (id) {
        return this.userArray.find(function (user) {
            return user.id === id;
        }) !== undefined;
    },

    getConnectedUsers: function () {
        return this.userArray.length;
    },

    addToMessageClients: function (userId, res, msgCounter) {
        this.messageClients[userId] = {response: res, counter: msgCounter};
    },

    addToStatsClients: function (userId, res) {
        this.statsClients[userId] = res;
    },

    updateAllMessageClients: function () {
        var client = {};
        var msgs = {};
        while (this.messageClients.length > 0) {
            client = this.messageClients.pop();
            msgs = messages.getMessages(client.counter);
            client.response.writeHead(200);
            client.response.writeHead({"Content-Type": "application/json"});
            client.response.end(JSON.stringify({messages: msgs, count: msgs.length}));
        }
    },

    updateAllStatsClients: function () {
        var client = {};
        var stats = {userCount: this.connectedUsers};
        stats.messageCount= messages.getMessageCount;
        while (this.statsClients.length > 0) {
            client = this.statsClients.pop();
            client.writeHead(200);
            client.writeHead({"Content-Type": "application/json"});
            client.end(JSON.stringify(stats));
        }
    },

    guid: function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

module.exports = Users;