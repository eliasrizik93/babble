
window.onload = function start() {

    Babble.checkUserRegister();
    var form = document.querySelector(".SendForm");
    hoverSend();
    Babble.sendMsg(form);
}

Babble = {
    MessageList: [],
    register: function (userInfo) {
        Babble.ServerService("post", "/register", userInfo, function (event) {
            SaveUserID(event.id);
            Babble.getStats(updateStates);
            counterMsg = document.getElementById("counterMsg").innerHTML;
            Babble.getMessages(0, Babble.updateMessageList);
        }, null);
    },
    getMessages: function (counter, callback) {
        Babble.ServerService("GET","/messages?counter="+counter,null,callback,null);
    },
    getStats: function (callback) {
        Babble.ServerService("GET", "/stats", null, callback, null);
    },
    getStatslongPolling: function (callback) {
        Babble.ServerService("GET", "/stats?longpolling=true", null, callback,null);
    },
    deleteMessage: function (id, callback) {
        Babble.ServerService("DELETE","/messages/:"+id,null,callback,null);
    },
    leave: function () {
        Babble.ServerService("post", "/leave", null, null,null);
    },
    postMessage: function (message, callback) {
        if(message!="")
        {
            var user = LoadLocalStorage();
            var messageInfo = {
                name:user.userInfo.name, email:user.userInfo.email, message: message,
                timestamp:getTime(),id:user.userInfo.id
            };
            Babble.ServerService("post","/messages",messageInfo,callback,null);
        }
    },
    updateMessageList: function (response) {
        //If response is null, timeout, just retry
        if (response) {

            if (response.id) {
                //Delete Message
                    Babble.MessageList = Babble.MessageList.filter(function (item) { return item.id != response.id; });
            }

            if (response.messages) {
                //Add all messages
                response.messages.forEach(function (newIitem) {
                    var found = false;
                    for (var i = 0; i < Babble.MessageList.length; i++) {
                        if (Babble.MessageList[i].id == newIitem.id)
                            found = true;
                    }

                    if (!found) {
                        Babble.MessageList.push(newIitem);
                    }
                });
            }
        }
        Babble.updateBoard();
        Babble.getMessages(Babble.MessageList.length, Babble.updateMessageList);
    },
    updateBoard: function () {
        var list = document.querySelector('ol');
        list.innerHTML = '';
        Babble.MessageList.forEach(function (message) {
            var messageItem = renderMessage(message)
            list.appendChild(messageItem);
        });
    },
    ServerService:function(method,url,data,doneCallback,errorCallback)
    {
        var baseUrl = "http://localhost:9000";
        var ajax = new XMLHttpRequest;
        if(url ==="/leave")
        {
            ajax.open(method, baseUrl + url, false);
        }else
        {
            ajax.open(method, baseUrl + url, true);
        }
        ajax.setRequestHeader('Content-Type', 'application/json');
        var userId = getUserId()
        if (userId != null)
            ajax.setRequestHeader('X-USER-ID', userId);

            ajax.onload = function () {
                if (ajax.status == 200) {
                    if (doneCallback != null) {
                        doneCallback(JSON.parse(ajax.responseText));
                    }
                } else if (errorCallback != null) {
                    errorCallback()
                }
            }

            if (data == null) {
                ajax.send();
            }
            else {
                ajax.send(JSON.stringify(data));
            }
    },
    addMsgToList: function(msgId){
    var user = LoadLocalStorage();
    var message = {
        name:user.userInfo.name,
        email:user.userInfo.email,
        message: user.currentMessage,
        timestamp:getTime(),
        UserID:user.userInfo.id,
        messageID:msgId.id
    };
    Babble.updateBoard();
    document.querySelector('textArea').value = '';
    },
    sendMsg:function(sendForm)
    {
        button =
        sendForm.addEventListener('submit', function(e){
            e.preventDefault();
            var msg = document.getElementById("textAreaChat").value;
            document.getElementById("textAreaChat").value="";
            setUserCurrentMsg(msg);
            Babble.postMessage(msg,Babble.addMsgToList);
        });
    },
    checkUserRegister:function() {
        if (localStorage.getItem("babble") === null) {

            var user = {
                currentMessage: "",
                userInfo: {
                    name: "",
                    email: "",
                    id: ""
                }
            };

            openModel();

            document.querySelector('.btnSave').addEventListener("click", function () {
                user.userInfo.name = document.getElementById('Name').value;
                user.userInfo.email = document.getElementById('Email').value;
                closeModel();
                SaveLocalStorage(user);
                Babble.register(user.userInfo);

            });

            document.querySelector('.btnAnonymous').addEventListener("click", function () {
                user.userInfo.name = "anonymous";
                user.userInfo.email = "";
                closeModel();
                SaveLocalStorage(user);
                Babble.register(user.userInfo);
            });
        }
        else {
            closeModel();
            Babble.register(LoadLocalStorage().userInfo);
        }
    }
}

function closeModel() {
    document.querySelector('.modal').style.visibility = 'hidden'
    document.querySelector('.modal').style.display = 'none';
}

function openModel() {
    document.querySelector('.modal').style.visibility = 'visible'
    document.querySelector('.modal').style.display = 'block';
}

function setUserCurrentMsg(msg)
{
   var user = JSON.parse(localStorage.getItem("babble"));
   user.currentMessage = msg;
   localStorage.setItem('babble',JSON.stringify(user));
}
function getUserId(){
    var userId = LoadLocalStorage('babble').userInfo.id;
    return userId;
}
function SaveLocalStorage(User){
    localStorage.setItem('babble',JSON.stringify(User));
}

function LoadLocalStorage(){
    var item = localStorage.getItem("babble")
    if (item == null) {
        return null;
    }
    var content = {};
    try {
        content = JSON.parse(item);
    } catch (e) {
        return null;
    }
    return content;
}
function updateStates(Stats){
    if(Stats)
    {
        document.getElementById("counterUser").innerHTML = Stats.userCount;
        document.getElementById("counterMsg").innerHTML = Stats.messageCount;
    }
    Babble.getStatslongPolling(updateStates);
}
function SaveUserID(ID){
   var user = JSON.parse(localStorage.getItem("babble"));
   user.userInfo.id = ID;
   localStorage.setItem('babble',JSON.stringify(user));
}
function getTime()
{
    var d = new Date().getTime();
    return d;
}

function hoverSend()
{
    var img = document.getElementById("sendImage");
    var textarea = document.getElementById("textAreaChat");
    img.addEventListener('mouseover',function allowSend(){
    if(textarea.value == '')
    {
        img.style.cursor = "not-allowed";
        return false;
    }
    else
    {
        img.style.cursor = "pointer";
        return true;
    }
});
}
function changeTime(milliseconds)
{
    var d = new Date(milliseconds);
    return d.getHours()+":"+(d.getMinutes()<10?'0':'') + d.getMinutes();
}
function renderMessage(msg) {
    user = LoadLocalStorage();
    var listItem = document.createElement("li");
    var image = document.createElement("img");
    image.setAttribute("class", "Images");
    image.setAttribute("alt", "");
    image.src = msg.avatar;//img
    listItem.appendChild(image);
    var span =  document.createElement("span");
    span.setAttribute("class","infoHeader");
    var cite = document.createElement("cite");
    cite.textContent = msg.name;//user name
    span.appendChild(cite);
    var time = document.createElement("time");
    time.textContent = changeTime(msg.timestamp);
    span.appendChild(time);
    var div = document.createElement("div");
    div.setAttribute("tabindex", "0");
    listItem.appendChild(div);
    div.appendChild(span);
    if(msg.userId == user.userInfo.id && user.userInfo.name != "anonymous")
    {
        var button = document.createElement("button");
        button.setAttribute("tabindex", "0");
        button.setAttribute("class","buttonDelete");
        button.setAttribute("id",msg.id);
        button.setAttribute("alt", "delete");
        button.setAttribute("aria-label", "Delete");
        button.addEventListener("click", function () {
            Babble.deleteMessage(msg.id, Babble.updateMessageList);
        });
        div.appendChild(button);
    }
    var paragraph = document.createElement("p");
    paragraph.textContent = msg.message;
    div.appendChild(paragraph);
    return listItem;
    }

    window.onbeforeunload = function () {
        Babble.leave();
        return null;
    }
