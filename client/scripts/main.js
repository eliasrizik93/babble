
window.onload = function start() {
    checkUserRegister();
    var form = document.querySelector(".SendForm");
    sendMsg(form);
}

Babble = {

    MessageList: [],

    register: function (userInfo) {
        ServerService("post", "/register", userInfo, function (event) {
            SaveUserID(event.id);
            Babble.getStats(updateStates);
            counterMsg = document.getElementById("counterMsg").innerHTML;
            Babble.getMessages(counterMsg,copyMessagesList);
        }, null);
    },

    getStats: function (callback) {
        ServerService("GET", "/stats", null, callback, null);
    },

    postMessage: function (message, callback) {
        var user = LoadLocalStorage();
        var messageInfo = {
            name:user.userInfo.name, email:user.userInfo.email, message: message,
            timestamp:getTime(),id:user.userInfo.id
        };
        ServerService("post","/messages",messageInfo,callback,null);
    },

    getMessages: function (counter, callback) {
           ServerService("GET","/messages?counter="+counter,null,callback,null);
    },

    deleteMessage: function (id, callback) {
        //ServerService("DELETE","/messages/:"+id,null,callback,deleteMessage(counter,callback));
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

function checkUserRegister() {
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
            babble.register(user);

        });

        document.querySelector('.btnAnonymous').addEventListener("click", function () {
            user.userInfo.name = "anonymous";
            user.userInfo.email = "";
            closeModel();
            SaveLocalStorage(user);
            babble.register(user);
        });
    }
    else {
        closeModel();
        Babble.register(LoadLocalStorage().userInfo);
    }
}

function ServerService(method,url,data,callback,ErrorFunction)
{
    var xhttp = new XMLHttpRequest;
    if(method !== "post")
    {
        xhttp.open(method,"http://localhost:9000"+url,true);
        xhttp.setRequestHeader('Content-Type','application/json');
        xhttp.setRequestHeader('X-USER-ID', getUserId());
        xhttp.onload = function (){
            if(xhttp.readyState == 4)
            {
                if((xhttp.status >= 200 && xhttp.status < 300) || xhttp.status == 304)
                {
                    if(callback != null)
                    {
                        console.log(JSON.parse(event.target.responseText));
                        callback(JSON.parse(event.target.responseText));
                    }
                }
                else
                {

                }
            }
        }
        xhttp.send(JSON.stringify(data));
    }
    else
    {
        xhttp.open("POST","http://localhost:9000"+url,true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.setRequestHeader('X-USER-ID', getUserId());
        xhttp.onload = function (){
            if(xhttp.readyState == 4)
            {
                if((xhttp.status >= 200 && xhttp.status < 300) || xhttp.status == 304)
                {
                   // console.log(JSON.parse(event.target.responseText));
                    if(callback != null)
                    {
                        callback(JSON.parse(event.target.responseText));
                      //  console.log(JSON.parse(event.target.responseText));
                    }
                }
                else
                {

                }
            }
        }
        xhttp.send(JSON.stringify(data));
    }
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
    return JSON.parse(localStorage.getItem("babble"));
}
function updateStates(newStats){
    document.getElementById("counterUser").innerHTML = newStats.userCount;
    document.getElementById("counterMsg").innerHTML = newStats.messageCount;
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
    // new date(d) erja3 date nafso naqso format
}
function sendMsg(sendForm)
{
    var img = document.getElementById("sendImage");
    img.addEventListener('click',function ChatMessage(){
        var msg = document.getElementById("textAreaChat").value;
        document.getElementById("textAreaChat").value="";
        setUserCurrentMsg(msg);
        Babble.postMessage(msg,addMsgToList);
    });
}

function addMsgToList(msgId){
    var user = LoadLocalStorage();
    var message = {
        name:user.userInfo.name,
        email:user.userInfo.email,
        message: user.currentMessage,
        timestamp:getTime(),
        UserID:user.userInfo.id,
        messageID:msgId.id
    };
    Babble.MessageList.push(message);
    Babble.getStats(updateStates);

}
function changeTime(milliseconds)
{
    var d = new Date(milliseconds);
    return d.getHours()+":"+d.getMinutes();
}
//3'eeer aza bt3'dar
function PrintMessages()
{
    for(i=0;i<Babble.MessageList.length;i++)
    {
        var msg = document.querySelector('#msg' + Babble.MessageList[i].id);
        if (msg === null || typeof(msg) === 'undefined' ) {
          NewMessage(Babble.MessageList[i]);
        }
    }
}
function copyMessagesList(msg)
{
    console.log(msg.messages);
    console.log(Babble.MessageList);
    Babble.MessageList = msg.messages.slice(0, msg.messages.length);
    PrintMessages();
    console.log(Babble.MessageList);
}
function NewMessage(msg) {
    user = LoadLocalStorage();
    var orderedList = document.getElementById("messagesListID");
    var listItem = document.createElement("li");
    orderedList.appendChild(listItem);
    var image = document.createElement("img");
    image.setAttribute("class", "");//naqees al class
    image.setAttribute("alt", "");
    image.src = msg.avatar;//img
    listItem.appendChild(image);
    var div = document.createElement("div");
    div.setAttribute("tabindex", "1");//shof aza m3tazenha
    listItem.appendChild(div);
    var cite = document.createElement("cite");
    cite.textContent = msg.name;//user name
    div.appendChild(cite);
    var time = document.createElement("time");
    time.textContent = changeTime(msg.timestamp);//naqees al time
    div.appendChild(time);
    // aza kan nafs al id esawe al button
    if(msg.userId == user.userInfo.id)
    {
        var button = document.createElement("button");
            button.setAttribute("arial-label","Delete");
            button.setAttribute("class",""); //naqess al class
            button.setAttribute("tabindex","1");
            button.textContent = "X";
            div.appendChild(button);
    }

    var paragraph = document.createElement("p");
    paragraph.textContent = msg.message;//message content
    div.appendChild(paragraph);
    }
    /*
    window.addEventListener("beforeunload",function(){
        ServerService("post","/unregister",userInfo,null,null);
    });*/