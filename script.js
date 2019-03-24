
// Get the hash of the url
const hash = window.location.hash
.substring(1)
.split('&')
.reduce(function (initial, item) {
  if (item) {
    var parts = item.split('=');
    initial[parts[0]] = decodeURIComponent(parts[1]);
  }
  return initial;
}, {});
window.location.hash = '';

// Set token
let _token = hash.access_token;

const authEndpoint = 'https://accounts.spotify.com/authorize';

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = '07dccd6fde8b4f0eb7437e9ed41ed591';
const redirectUri = 'https://hello-radio.glitch.me/';
const scopes = [
  'streaming',
  'user-read-birthdate',
  'user-read-private',
  'user-modify-playback-state'
];

// If there is no token, redirect to Spotify authorization
if (!_token) {
  window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;
}

// Set up the Web Playback SDK

window.onSpotifyPlayerAPIReady = () => {
  const player = new Spotify.Player({
    name: 'Web Playback SDK Template',
    getOAuthToken: cb => { cb(_token); }
  });

  // Error handling
  player.on('initialization_error', e => console.error(e));
  player.on('authentication_error', e => console.error(e));
  player.on('account_error', e => console.error(e));
  player.on('playback_error', e => console.error(e));

  // Playback status updates
  player.on('player_state_changed', state => {
    $('#current-track').attr('src', state.track_window.current_track.album.images[0].url);
    $('#current-track-name').text(state.track_window.current_track.name);
  });

  // Ready
  player.on('ready', data => {
    const play_button = document.getElementById('play-button');
    play_button.addEventListener('click', () => play(data.device_id));
    
    document.getElementById('loading').style="display:none;";
    document.getElementById('play-button').classList.remove("hidden");
  });

  // Connect to the player!
  player.connect();
}

// Play a specified track on the Web Playback SDK's device ID
function play(device_id) {
  const [playlist, richie_first] = getShuffledPlaylist();
  
  $.ajax({
   url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
   type: "PUT",
   data: playlist,
   beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + _token );},
   success: function(data) { 
     const dancers = document.getElementsByClassName('dancer');
     dancers.map = Array.prototype.map;
     dancers.map(dancer => dancer.classList.remove("hidden"));
     
     document.getElementById('player-row').classList.remove("hidden");
     document.getElementById('play-button').innerHTML = "Say hello again";
     
     if(richie_first){
        document.getElementById("lionel-container").classList.remove("hidden");
      } else {
        document.getElementById("lionel-container").classList.add("hidden");
      }
   }
  });
}

// Shuffle the song list everytime the user presses play
function getShuffledPlaylist() {
  let richie_first = false;
  
  const spotify_uris = [
    "spotify:track:0mHyWYXmmCB9iQyK18m3FQ", // Lionel Richie
    "spotify:track:4sPmO7WMQUAf45kwMOtONw", // Adele
    "spotify:track:08hlFtp8y9S6YZmjBNvQ1I",  // Book of Mormon
    "spotify:track:30Chv2SmIry70YwtmtaKnj", // JCole
    "spotify:track:5O23P3zSmEh3GP9g9NFPBS", // PRETTYMUCH
  ];
  
  for (let i = spotify_uris.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [spotify_uris[i], spotify_uris[j]] = [spotify_uris[j], spotify_uris[i]];
  }
  
  // show Lionel Richie gif when he's up
  if (spotify_uris[0] === "spotify:track:0mHyWYXmmCB9iQyK18m3FQ") {
    richie_first = true;
  }
  
  return [JSON.stringify({"uris": spotify_uris}), richie_first];
}