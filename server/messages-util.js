/*jslint this, node: true */
"use strict";

var users = require("./users-util");

var Messages = {

    //{name: String, email:String, message:String,timestamp:Number(ms)}

    messageArray: [],

    //messages.addMessage(message:Object) : Number(id)
    addMessage: function (message) {
        message.id = this.guid();
        this.messageArray.push(message);
        return message.id;
    },

    //messages.getMessages(counter:Number) : Array(messages)
    getMessages: function (counter) {
        if (counter >= this.messageArray.length) {
            return [];
        }
        var messages = this.messageArray.slice(counter);
        messages.forEach(function (msg) {msg.avatar = users.getUserById(msg.userId).avatar;});
        return messages;
    },

    // messages.deleteMessage(id:String) : void
    deleteMessage: function (id) {
        this.messageArray = this.messageArray.filter(function (msg) {
            return msg.id === id;
        });
    },

    //messages.getMessageCount() : Number(count)
    getMessageCount: function () {
        return this.messageArray.length;
    },

    guid: function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

module.exports = Messages;