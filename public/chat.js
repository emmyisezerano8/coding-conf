const username =
    localStorage.getItem("ipchat_username");

const room =
    new URLSearchParams(window.location.search)
        .get("room") ||
    localStorage.getItem("ipchat_room");

if (!username || !room) {
    window.location.href = "index.html";
}


/* ELEMENTS */

const roomName =
    document.getElementById("roomName");

const chatTitle =
    document.getElementById("chatTitle");

const messages =
    document.getElementById("messages");

const messageForm =
    document.getElementById("messageForm");

const messageInput =
    document.getElementById("messageInput");

const usersList =
    document.getElementById("usersList");

const onlineCount =
    document.getElementById("onlineCount");

const typing =
    document.getElementById("typing");

const leaveButton =
    document.getElementById("leaveButton");


roomName.textContent = room;
chatTitle.textContent = "# " + room;


/* UNIQUE USER ID */

const userId =
    Date.now().toString() +
    Math.random().toString(36).slice(2);


/* CHANNEL */

const channel =
    new BroadcastChannel(
        "ipchat_" + room
    );


/* USERS */

const users = new Map();

users.set(userId, {
    id: userId,
    username: username
});


/* ANNOUNCE USER */

channel.postMessage({
    type: "user-join",
    id: userId,
    username: username
});


/* RECEIVE EVENTS */

channel.addEventListener(
    "message",
    function (event) {

        const data = event.data;

        if (!data) return;


        /* USER JOINED */

        if (data.type === "user-join") {

            users.set(data.id, {
                id: data.id,
                username: data.username
            });

            renderUsers();

            channel.postMessage({
                type: "user-response",
                id: userId,
                username: username
            });

            return;
        }


        /* USER RESPONSE */

        if (data.type === "user-response") {

            users.set(data.id, {
                id: data.id,
                username: data.username
            });

            renderUsers();

            return;
        }


        /* USER LEFT */

        if (data.type === "user-leave") {

            users.delete(data.id);

            renderUsers();

            addSystemMessage(
                data.username + " left the room."
            );

            return;
        }


        /* CHAT MESSAGE */

        if (data.type === "message") {

            addMessage(data);

            return;
        }


        /* TYPING */

        if (data.type === "typing") {

            if (data.id !== userId) {

                typing.textContent =
                    data.typing
                        ? data.username +
                          " is typing..."
                        : "";
            }

            return;
        }

    }
);


/* SEND MESSAGE */

messageForm.addEventListener(
    "submit",
    function (e) {

        e.preventDefault();

        const text =
            messageInput.value.trim();

        if (!text) return;


        const message = {

            type: "message",

            id:
                Date.now() +
                Math.random(),

            userId: userId,

            username: username,

            text: text,

            time:
                new Date().toISOString()
        };


        channel.postMessage(message);

        addMessage(message);

        messageInput.value = "";

        messageInput.focus();

        channel.postMessage({
            type: "typing",
            id: userId,
            username: username,
            typing: false
        });
    }
);


/* TYPING */

let typingTimer;

messageInput.addEventListener(
    "input",
    function () {

        channel.postMessage({
            type: "typing",
            id: userId,
            username: username,
            typing:
                messageInput.value.length > 0
        });

        clearTimeout(typingTimer);

        typingTimer = setTimeout(
            function () {

                channel.postMessage({
                    type: "typing",
                    id: userId,
                    username: username,
                    typing: false
                });

            },
            1000
        );
    }
);


/* DISPLAY USERS */

function renderUsers() {

    usersList.replaceChildren();

    onlineCount.textContent =
        users.size;

    users.forEach(function (user) {

        const item =
            document.createElement("div");

        item.className = "user";


        const avatar =
            document.createElement("div");

        avatar.className = "avatar";

        avatar.textContent =
            user.username
                .charAt(0)
                .toUpperCase();


        const name =
            document.createElement("span");

        name.textContent =
            user.username;


        const dot =
            document.createElement("i");

        dot.className = "online-dot";


        item.append(
            avatar,
            name,
            dot
        );


        usersList.appendChild(item);
    });
}


/* DISPLAY MESSAGE */

function addMessage(message) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        message.userId === userId
            ? "message own"
            : "message";


    const name =
        document.createElement("strong");

    name.textContent =
        message.username;


    const text =
        document.createElement("p");

    text.textContent =
        message.text;


    const time =
        document.createElement("small");

    time.textContent =
        formatTime(message.time);


    wrapper.append(
        name,
        text,
        time
    );


    messages.appendChild(wrapper);

    messages.scrollTop =
        messages.scrollHeight;
}


/* SYSTEM MESSAGE */

function addSystemMessage(text) {

    const element =
        document.createElement("div");

    element.className =
        "system-message";

    element.textContent =
        text;

    messages.appendChild(element);

    messages.scrollTop =
        messages.scrollHeight;
}


/* TIME */

function formatTime(date) {

    return new Date(date)
        .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
}


/* LEAVE */

leaveButton.addEventListener(
    "click",
    function () {

        channel.postMessage({
            type: "user-leave",
            id: userId,
            username: username
        });

        channel.close();

        localStorage.removeItem(
            "ipchat_username"
        );

        localStorage.removeItem(
            "ipchat_room"
        );

        window.location.href =
            "index.html";
    }
);


/* BROWSER/TAB CLOSE */

window.addEventListener(
    "beforeunload",
    function () {

        channel.postMessage({
            type: "user-leave",
            id: userId,
            username: username
        });

        channel.close();
    }
);


renderUsers();

messageInput.focus();