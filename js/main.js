"use strict";

const fileInput = document.getElementById("fileinput");
const startButton = document.getElementById("startButton");
const peerid = document.getElementById("peerid");
const myid = document.getElementById("myid");
const readytext = document.getElementById("readytext");
let fileloaded = false;
let haveid = false;
let playing = false;
const myPlayer = videojs("my-video");
let peer;
let conn;

fileInput.onchange = () => {
  console.log("fileinput onchange");
  fileloaded = true;
  peer = new Peer();
  peer.on("open", (id) => {
    console.log("peerjs started with id " + id);
    myid.textContent = id;
  });
  peer.on("connection", handleincoming);
  if (fileloaded && haveid) {
    startButton.disabled = false;
  }
  peer.on("error", console.error);
};

peerid.oninput = () => {
  console.log("peerid on input");
  haveid = true;
  if (fileloaded && haveid) {
    startButton.disabled = false;
  }
};

/**
 * Loads media file specified in the file input field, for playing
 *
 */
function readyPlayer() {
  const filename = fileInput.files[0].name;
  const fileUrl = URL.createObjectURL(fileInput.files[0]);
  const fileType = fileInput.files[0].type;
  console.log(filename);
  myPlayer.src({ type: fileType, src: fileUrl });
  myPlayer.load();
  myPlayer.on("play", () => conn.send({ event: "PLAY" }));
  myPlayer.on("pause", () => conn.send({ event: "PAUSE" }));
  myPlayer.on("ended", () => conn.send({ event: "ENDED" }));
  myPlayer.on("seeked", (data) => conn.send({ event: "SEEKED", data: data }));
  readytext.textContent = "Press play to start!";
}

startButton.addEventListener("click", function () {
  // ready
  console.log("connecting to " + peerid.value);
  conn = peer.connect(peerid.value);
  conn.on("open", () => console.log("connection now open"));
  conn.on("data", onData);
  conn.send("READY");
  conn.on("error", console.error);
  readyPlayer();
});

/**
 * Handles incoming connections by attaching onData event listener.
 *
 * @param {DataConnection} con The incoming connection object.
 *
 *
 */
function handleincoming(con) {
  conn = con;
  readyPlayer();
  conn.on("open", () => {
    console.log("incoming connection");

    conn.on("data", onData);
  });
}

/**
 * Handles the 'data' event of a DataConnection object
 *
 * @param {*} input The data received.
 */
function onData(input) {
  console.log("got data " + data);
  const { event, data } = input;
  if (event == "READY") {
    if (myPlayer.readyState() == 0) {
      readyPlayer();
      conn.send("READY");
    }
  } else if (event == "PLAY") {
    if (!playing) {
      myPlayer.play();
      playing = true;
    }
  } else if (event == "PAUSE") {
    if (playing) {
      myPlayer.pause();
      playing = false;
    }
  } else if (event === "ENDED") {
    alert("Thanks for the lovely date Anu 😘");
  } else if (event === "SEEKED") {
    myPlayer.currentTime = data.target.currentTime
  }
}
