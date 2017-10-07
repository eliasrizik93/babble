/*jslint this, node: true */
"use strict";

var http = require("http");
var url = require("url");

var messages = require("./messages-util");
var users = require("./users-util");

var port = 9000;
var server = http.createServer(function (req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-USER-ID");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");

    var requestUrl = url.parse(req.url, true);

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end("HTTP 204 No Content");
        return;
    }

    if (req.headers["content-type"] !== "application/json") {
        res.writeHead(400);
        res.end("HTTP 400 Bad Request");
        return;
    }

    //POST /messages
    //GET /messages?counter=XX
    if (requestUrl.pathname === "/messages") {
        if (req.method === "GET") {
            if (!requestUrl.query || !requestUrl.query.counter || isNaN(requestUrl.query.counter) || Object.keys(requestUrl.query).length > 1) {
                res.writeHead(400);
                res.end("HTTP 400 Bad Request");
                return;
            }

            if (!req.headers["x-user-id"] || !users.isLoggedIn(req.headers["x-user-id"])) {
                res.writeHead(400);
                res.end("HTTP 400 Bad Request");
                return;
            }

            var counter = requestUrl.query.counter;
            var newMessages = messages.getMessages(counter);
            if (newMessages && newMessages.length > 0) {
                var payload = {messages: newMessages, count: messages.getMessageCount()};
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(payload));
                return;
            }

            users.addToMessageClients(req.headers["x-user-id"], res, counter);
            return;

        } else if (req.method === "POST") {

            var msgPostPayload = "";
            req.on("data", function (data) {
                msgPostPayload += data;
            });
            req.on("end", function () {
                var message = {};
                try {
                    message = JSON.parse(msgPostPayload);
                } catch (e) {
                    res.writeHead(400);
                    res.end("HTTP 400 Bad Request");
                    return;
                }

                if (!Object.keys(message).includes("message")) {
                    res.writeHead(400);
                    res.end("HTTP 400 Bad Request");
                    return;
                }

                if (!req.headers["x-user-id"] || !users.isLoggedIn(req.headers["x-user-id"])) {
                    res.writeHead(400);
                    res.end("HTTP 400 Bad Request");
                    return;
                }

                message.userId = req.headers["x-user-id"];
                var messageId = messages.addMessage(message);
                users.updateAllMessageClients();
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify({id: messageId}));
                return;

            });
            return;

        } else {
            res.writeHead(405);
            res.end("HTTP 405 Method Not Allowed");
            return;
        }
    }

    //DELETE /messages/:id
    if (requestUrl.pathname.substring(0, 10) === "/messages/") {
        if (req.method !== "DELETE") {
            res.writeHead(405);
            res.end("HTTP 405 Method Not Allowed");
            return;
        }

        var messageId = requestUrl.pathname.substring(10);
        if (isNaN(messageId)) {
            res.writeHead(404);
            res.end("HTTP 404 Not found");
            return;
        }

        if (!req.headers["x-user-id"] || !users.isLoggedIn(req.headers["x-user-id"])) {
            res.writeHead(400);
            res.end("HTTP 400 Bad Request");
            return;
        }

        messages.deleteMessage(messageId);
        users.updateAllMessageClients();
        res.writeHead(200);
        res.end("HTTP 200 Success");
        return;
    }

    //GET /stats
    if (requestUrl.pathname === "/stats") {
        if (req.method !== "GET") {
            res.writeHead(405);
            res.end("HTTP 405 Method Not Allowed");
            return;
        }

        if (!req.headers["x-user-id"] || !users.isLoggedIn(req.headers["x-user-id"])) {
            res.writeHead(400);
            res.end("HTTP 400 Bad Request");
            return;
        }

        //change to true if you want to use long polling for stats call
        var longPolling = false;

        if (longPolling) {
            users.addToStatsClients(req.headers["x-user-id"], res);
            return;
        } else {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({userCount: users.getConnectedUsers(), messageCount: messages.getMessageCount()}));
            return;
        }
    }

    //POST /register
    if (requestUrl.pathname === "/register") {
        if (req.method !== "POST") {
            res.writeHead(405);
            res.end("HTTP 405 Method Not Allowed");
            return;
        }

        //User already logged in ?
        if (req.headers["x-user-id"] && users.isLoggedIn(req.headers["x-user-id"])) {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({id: req.headers["x-user-id"]}));
            return;
        }

        var regPayload = "";
        req.on("data", function (data) {
            regPayload += data;
        });
        req.on("end", function () {
            var message = {};
            try {
                message = JSON.parse(regPayload);
            } catch (e) {
                res.writeHead(400);
                res.end("HTTP 400 Bad Request");
                return;
            }

            var userId = users.login(message.name, message.email);
            users.updateAllStatsClients();
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({id: userId}));
            return;
        });
        return;
    }

    //POST /unregister
    if (requestUrl.pathname === "/unregister") {
        if (req.method !== "POST") {
            res.writeHead(405);
            res.end("HTTP 405 Method Not Allowed");
            return;
        }

        if (!req.headers["x-user-id"] || !users.isLoggedIn(req.headers["x-user-id"])) {
            res.writeHead(400);
            res.end("HTTP 400 Bad Request");
            return;
        }

        users.logout(req.headers["x-user-id"]);
        users.updateAllStatsClients();
        res.writeHead(200);
        res.end("HTTP 200 Success");
        return;
    }

    res.writeHead(404);
    res.end("HTTP 404 Not found");
    return;
}).listen(port);

module.exports = server;