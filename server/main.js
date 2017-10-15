/*jslint this, node: true */
"use strict";

var http = require("http");
var url = require("url");

var users = require("./users-util");
var messages = require("./messages-util");


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
                var payload = { messages: newMessages };
                payload.count = messages.getMessageCount();

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(payload));
                return;
            }

            users.addToMessageClients(res, counter);
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
                message.avatar = users.getAvatar(req.headers["x-user-id"]);
                var messageId = messages.addMessage(message);
                users.updateAllMessageClients();
                users.updateAllStatsClients();
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ id: messageId }));
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

        var messageId = requestUrl.pathname.substring(11);
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(messageId) !== true) {
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
        users.updateAllMessageClients(messageId);
        users.updateAllStatsClients();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ id: messageId }));
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

        var longPolling = requestUrl.query && requestUrl.query.longpolling;

        if (longPolling) {
            users.addToStatsClients(res);
            return;
        } else {
            var payload = {};
            payload.userCount = users.getConnectedUsers();
            payload.messageCount = messages.getMessageCount();

            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(payload));
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
        var userId = req.headers["x-user-id"];
        if (userId && users.isLoggedIn(userId)) {
            res.writeHead(200, { "Content-Type": "application/json" });
            var userInfo = users.getUserById(userId);
            res.end(JSON.stringify(userInfo));
            return;
        }

        var regPayload = "";
        req.on("data", function (data) {
            regPayload += data;
        });
        req.on("end", function () {
            var userInfo = {};
            try {
                userInfo = JSON.parse(regPayload);
            } catch (e) {
                res.writeHead(400);
                res.end("HTTP 400 Bad Request");
                return;
            }

            userInfo = users.login(userInfo.id,userInfo.name, userInfo.email);
            users.updateAllStatsClients();
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(userInfo));
            return;
        });
        return;
    }

    //POST /leave
    if (requestUrl.pathname === "/leave") {
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