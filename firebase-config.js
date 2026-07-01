firebase.initializeApp({
  apiKey: "AIzaSyB7bSNTnulcVoo9afiWrGKcJHw7VHtOV_Q",
  authDomain: "clashroom-1d0a4.firebaseapp.com",
  databaseURL: "https://clashroom-1d0a4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "clashroom-1d0a4",
  storageBucket: "clashroom-1d0a4.firebasestorage.app",
  messagingSenderId: "880259090891",
  appId: "1:880259090891:web:4255f1318cec4ef00d0e4e"
});

var db = firebase.database();
var SERVER_TS = firebase.database.ServerValue.TIMESTAMP;

function generateRoomCode() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var code = '';
  for (var i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function sanitizeKey(s) {
  return String(s).replace(/[.#$\[\]\/\s]/g, '_').toLowerCase();
}

function roomRef(code) {
  return db.ref('rooms/' + code);
}
