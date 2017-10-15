/*jslint this, node: true */
"use strict";

var gravatar = require("./gravatar-util");
var messages = require("./messages-util");

var Users = {

    userArray: [],
    messageClients: [],
    statsClients: [],

    login: function (userid,username, useremail) {
        if(userid == "")
        {
            var user = {
                id: this.guid(),
                name: username,
                email: useremail
            };
        }
        else
        {
            var user = {
                id: userid,
                name: username,
                email: useremail
            };
        }
        user.avatar = gravatar.getimageUrl(useremail);

        this.userArray.push(user);
        return user;
    },

    getAvatar: function (userId) {
        return this.getUserById(userId).avatar;
    },

    getUserById: function (userId) {
        return this.userArray.find(function (user) {
            return user.id === userId;
        });
    },

    logout: function (id) {
        this.userArray = this.userArray.filter(function (user) {
            return user.id !== id;
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
    addToMessageClients: function (res, msgCounter) {
        this.messageClients.push({response: res, counter: msgCounter});
    },

    addToStatsClients: function (res) {
        this.statsClients.push(res);
    },

    updateAllMessageClients: function (deletedMessageId) {
        var client = {};
        var content = [];

        while (this.messageClients.length > 0) {
            client = this.messageClients.pop();

            if (deletedMessageId === undefined) {
                var msgs = messages.getMessages(client.counter);
                content = { messages: msgs, count: msgs.length }
            } else {
                content = { id: deletedMessageId };
            }

            client.response.writeHead(200, { "Content-Type": "application/json" });
            client.response.end(JSON.stringify(content));
        }
    },

    updateAllStatsClients: function () {
        var client = {};
        var stats = {}
        stats.userCount = this.getConnectedUsers();
        stats.messageCount = messages.getMessageCount();
        while (this.statsClients.length > 0) {
            client = this.statsClients.pop();
            client.writeHead(200, { "Content-Type": "application/json" });
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