const form = document.getElementById("loginForm");
const username = document.getElementById("username");
const room = document.getElementById("room");
const error = document.getElementById("error");

form.addEventListener("submit", function (e) {

  e.preventDefault();

  const name = username.value.trim();
  const roomCode = room.value.trim();

  if (name.length < 2) {
    error.textContent = "Username must contain at least 2 characters.";
    return;
  }

  if (roomCode.length < 2) {
    error.textContent = "Enter a valid room code.";
    return;
  }

  localStorage.setItem("ipchat_username", name);
  localStorage.setItem("ipchat_room", roomCode);

  window.location.href =
    "chat.html?room=" +
    encodeURIComponent(roomCode);
});