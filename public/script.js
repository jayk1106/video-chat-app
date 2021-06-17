const socket = io('/');

const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443',
})


myPeer.on('open', userId => {
    socket.emit('join-room', ROOM_ID, userId, USER_NAME);
})

const bigPri = document.getElementById('bigPri');
const smallPri = document.getElementById('smallPri');
const guestVideo = document.createElement("video");





// Invite Box
// console.log(window.location.href);

const roomurl = document.getElementById('roomurl');
roomurl.innerHTML = `<span class='urlbox'>${window.location.href}</span>`;

function openInviteBox() {
    const inviteBox = document.getElementById('inviteBox');
    inviteBox.style.display = 'flex';
}
function closeInviteBox() {
    const inviteBox = document.getElementById('inviteBox');
    inviteBox.style.display = 'none';
}





const allUsers = {};
let localStream;
let callStream;

// Create video element for user
const myVideo = document.createElement('video');
myVideo.setAttribute('id', 'small');
myVideo.muted = true;

var getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

//Access user's camara and microphone
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then(myStream => {

    localStream = myStream;
    // To append stream to screen
    console.log("localstream builded " + localStream);
    myVideo.srcObject = myStream;
    myVideo.addEventListener('loadedmetadata', () => {
        myVideo.play();
    })

    smallPri.appendChild(myVideo);

    // When guest connected
    socket.on('guest-connected', (userId, userName) => {
        guestConnectedMessage(userName);
        socket.emit('recivedcall', USER_NAME);
        // Call guest when he connected
        var call = myPeer.call(userId, myStream);
        console.log("outgoing call", call);
        // guestVideo.setAttribute('id', 'big');

        call.on('stream', guestStream => {
            console.log("Outgoiing calls rosponse" ,guestStream);
            guestVideo.srcObject = guestStream;
            guestVideo.addEventListener('loadedmetadata', () => {
                guestVideo.play();
            })
            const bigPri = document.getElementById('bigPri');
            bigPri.appendChild(guestVideo);

        })
        call.on('close', () => {
            guestVideo.remove();
        })

        allUsers[userId] = call;
    })


}).catch((err)=>{
    console.log("Can't able to access camara" , err);
})


socket.on('user-disconnect', (userId, name) => {
    if (allUsers[userId]) allUsers[userId].close();
    guestVideo.remove();
    userLeaveMessage(name);
})

socket.on('guestJoindMessage', name => {
    guestConnectedMessage(name);
})

// let callStream;
// myPeer.on("call", function (call) {
//     console.log("incomming call outside" , call);
//     getUserMedia(
//       { video: true, audio: true },
//       function (myStream) {
//         callStream  = myStream;
//         call.answer(myStream); // Answer the call with an A/V stream.

//         call.on("stream", function (guestStream) {
//             guestVideo.srcObject = guestStream;
//             guestVideo.addEventListener('loadedmetadata' , () => {
//                 guestVideo.play();
//             })
//             bigPri.appendChild(guestVideo);
//         });
//       },
//       function (err) {
//         console.log("Failed to get local stream", err);
//       }
//     );
// });
// let callStream;
myPeer.on('call', call => {
    console.log("Incomming calls" , call);
    console.log("second" + localStream);
    if (localStream) {
        console.log("localstream works");
        call.answer(myStream); // Answer the call with an A/V stream.

        call.on("stream", function (guestStream) {
            console.log("Incomming calls rosponse" ,guestStream);
            guestVideo.srcObject = guestStream;
            guestVideo.addEventListener('loadedmetadata', () => {
                guestVideo.play();
            })
            bigPri.appendChild(guestVideo);
        });
    }
    else {
        console.log("localstream not works");
        getUserMedia(
            { video: true, audio: true },
            function (myStream) {
                callStream = myStream;
                call.answer(myStream); // Answer the call with an A/V stream.

                call.on("stream", function (guestStream) {
                    guestVideo.srcObject = guestStream;
                    guestVideo.addEventListener('loadedmetadata', () => {
                        guestVideo.play();
                    })
                    bigPri.appendChild(guestVideo);
                });
            },
            function (err) {
                console.log("Failed to get local stream", err);
            }
        );
    }
})




socket.on('custom-err', msg => {
    alert(msg);
});

function leaveMeetting() {
    window.location.replace('/thankyou');
}

function playStopVideo() {
    let enabled = localStream.getVideoTracks()[0].enabled;
    const playstopvideo = document.getElementById('playstopvideo');
    if (enabled) {
        localStream.getVideoTracks()[0].enabled = false;
        setPlayVideo(playstopvideo);
    } else {
        setStopVideo(playstopvideo);
        localStream.getVideoTracks()[0].enabled = true;
    }
    if (callStream) {
        let enabled2 = callStream.getVideoTracks()[0].enabled;
        if (enabled2) {
            callStream.getVideoTracks()[0].enabled = false;
            setPlayVideo(playstopvideo);
        } else {
            setStopVideo(playstopvideo);
            callStream.getVideoTracks()[0].enabled = true;
        }
    }

}

function muteUnmute() {
    const enabled = localStream.getAudioTracks()[0].enabled;
    const muteunmute = document.getElementById('muteunmute');
    if (enabled) {
        localStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton(muteunmute);
    } else {
        setMuteButton(muteunmute);
        localStream.getAudioTracks()[0].enabled = true;
    }
    if (callStream) {
        let enabled2 = callStream.getAudioTracks()[0].enabled;
        if (enabled2) {
            callStream.getAudioTracks()[0].enabled = false;
            setUnmuteButton(muteunmute);
        } else {
            setMuteButton(muteunmute);
            callStream.getAudioTracks()[0].enabled = true;
        }
    }
}

function setUnmuteButton(div) {
    div.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    div.style = "background-color:rgb(204, 34, 34);";
}
function setMuteButton(div) {
    div.innerHTML = '<i class="fas fa-microphone"></i>';
    div.style = "background-color:#0078d7;";
}
function setPlayVideo(video) {
    video.innerHTML = '<i class="fas fa-video-slash" ></i>';
    video.style = "background-color:rgb(204, 34, 34);";
}
function setStopVideo(video) {
    video.innerHTML = '<i class="fas fa-video"></i>';
    video.style = "background-color:#0078d7";
}

// Chat 
const msgBox = document.getElementById('chatmessagebox');
function sendMessage() {
    const messageValue = document.getElementById('messageValue');
    const message = messageValue.value;
    if (message) {
        appendMessage(message);
        socket.emit('sendMessage', message, USER_NAME);
        messageValue.value = "";
    }
}

socket.on('reciveMessage', (msg, name) => {
    const yourMsg = `<div class="guest__message">${name}: ${msg}</div>`;
    msgBox.insertAdjacentHTML('beforeend', yourMsg);
})


function appendMessage(msg) {
    const yourMsg = `<div class="your__message">You: ${msg}</div>`;
    msgBox.insertAdjacentHTML('beforeend', yourMsg);
}

function guestConnectedMessage(name) {
    const yourMsg = `<div class="your__message">${name} Join</div>`;
    msgBox.insertAdjacentHTML('beforeend', yourMsg);
    const addNewUser = document.getElementById('addNewUser');
    addNewUser.style.display = 'none';
}

function userLeaveMessage(name) {
    const yourMsg = `<div class="your__message">${name} Leaved</div>`;
    msgBox.insertAdjacentHTML('beforeend', yourMsg);
    const addNewUser = document.getElementById('addNewUser');
    addNewUser.style.display = 'flex';
}