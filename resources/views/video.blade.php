@extends('welcome')
@section('content')
<example-component></example-component> 
{{-- <create-resource-component></create-resource-component> --}}
{{-- <calling-component></ --}}
{{-- 
<div class="container">
    <div class="row py-3">
      <div class="col-12 col-md-4">
        <div class="card">
          <div class="card-body">
            <h5>Connect</h5>
            <div class="form-group">
              <label for="project">Project</label>
              <input type="text" class="form-control" id="project" placeholder="Enter Project ID" onchange="saveInLocalStorage(event)">
            </div>
            <div class="form-group">
              <label for="token">Token</label>
              <input type="text" class="form-control" id="token" placeholder="Enter your JWT" onchange="saveInLocalStorage(event)">
            </div>
            <button id="btnConnect" class="btn btn-block btn-success" onclick="connect()">Connect</button>
            <button id="btnDisconnect" class="btn btn-block btn-danger d-none" onclick="disconnect()">Disconnect</button>

            <div class="text-center mt-3 text-muted">
              <small>Status: <span id='connectStatus'>Not Connected</span></small>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-8 mt-4 mt-md-1">
        <div class="row">
          <div class="col-6">
            <h5>Local Video</h5>
            <video id="localVideo" autoplay="true" class="w-100" style="background-color: #000; border: 1px solid #ccc; border-radius: 5px;"></video>
          </div>
          <div class="col-6">
            <h5>Remote Video</h5>
            <video id="remoteVideo" autoplay="true" class="w-100" playsinline style="background-color: #000; border: 1px solid #ccc; border-radius: 5px;"></video>
          </div>
        </div>

        <div class="form-group">
          <label for="number">Call To:</label>
          <input type="text" class="form-control" id="number" placeholder="Enter Resource or Number to Dial" onchange="saveInLocalStorage(event)">
        </div>
        <div>Call Options:</div>
        <div class="form-check">
          <input type="checkbox" id="audio" value="1" onchange="saveInLocalStorage(event)">
          <label class="form-check-label" for="audio">
            Include Audio
          </label>
        </div>
        <div class="form-check">
          <input type="checkbox" id="video" value="1" onchange="saveInLocalStorage(event)">
          <label class="form-check-label" for="video">
            Include Video
          </label>
        </div>
        <button id="startCall" class="btn btn-primary px-5 mt-4" onClick="makeCall()" disabled="true">Call</button>
        <button id="hangupCall" class="btn btn-danger px-5 mt-4 d-none" onClick="hangup()" disabled="true">Hang up</button>
      </div>
    </div> --}}
@endsection

@push('scripts')
{{--     
  <script type="text/javascript">
    var client;
    var currentCall = null;

    var project = localStorage.getItem('relay.example.project') || '';
    var token = localStorage.getItem('relay.example.token') || '';
    var number = localStorage.getItem('relay.example.number') || '';
    var audio = localStorage.getItem('relay.example.audio') || '1';
    var video = localStorage.getItem('relay.example.video') || '1';

    /**
     * On document ready auto-fill the input values from the localStorage.
    */
    ready(function() {
      document.getElementById('project').value = project;
      document.getElementById('token').value = token;
      document.getElementById('number').value = number;
      document.getElementById('audio').checked = audio === '1';
      document.getElementById('video').checked = video === '1';
    });

    /**
     * Connect with Relay creating a client and attaching all the event handler.
    */
    function connect() {
      client = new Relay({
        project: document.getElementById('project').value,
        token: document.getElementById('token').value
      });

      // client.autoRecoverCalls = false;
      client.remoteElement = 'remoteVideo';
      client.localElement = 'localVideo';
      client.iceServers = [{ urls: ['stun:stun.l.google.com:19302'] }];
      if (document.getElementById('audio').checked) {
        client.enableMicrophone()
      } else {
        client.disableMicrophone()
      }
      if (document.getElementById('video').checked) {
        client.enableWebcam()
      } else {
        client.disableWebcam()
      }

      client.on('signalwire.ready', function() {
        btnConnect.classList.add('d-none');
        btnDisconnect.classList.remove('d-none');
        connectStatus.innerHTML = 'Connected';

        startCall.disabled = false;
      });

      // Update UI on socket close
      client.on('signalwire.socket.close', function() {
        btnConnect.classList.remove('d-none');
        btnDisconnect.classList.add('d-none');
        connectStatus.innerHTML = 'Disconnected';
      });

      // Handle error...
      client.on('signalwire.error', function(error){
        console.error("SignalWire error:", error);
      });

      client.on('signalwire.notification', handleNotification);

      connectStatus.innerHTML = 'Connecting...';
      client.connect();
    }

    function disconnect() {
      connectStatus.innerHTML = 'Disconnecting...';
      client.disconnect();
    }

    /**
     * Handle notification from the client.
    */
    function handleNotification(notification) {
      console.log("notification", notification.type, notification);
      switch (notification.type) {
        case 'callUpdate':
          handleCallUpdate(notification.call);
          break;
        case 'userMediaError':
          // Permission denied or invalid audio/video params on `getUserMedia`
          break;
      }
    }

    /**
     * Update the UI when the call's state change
    */
    function handleCallUpdate(call) {
      currentCall = call;

      switch (call.state) {
        case 'new': // Setup the UI
          break;
        case 'trying': // You are trying to call someone and he's ringing now
          break;
        case 'recovering': // Call is recovering from a previous session
          if (confirm('Recover the previous call?')) {
            currentCall.answer();
          } else {
            currentCall.hangup();
          }
          break;
        case 'ringing': // Someone is calling you
          if (confirm('Pick up the call?')) {
            currentCall.answer();
          } else {
            currentCall.hangup();
          }
          break;
        case 'active': // Call has become active
          startCall.classList.add('d-none');
          hangupCall.classList.remove('d-none');
          hangupCall.disabled = false;
          break;
        case 'hangup': // Call is over
          startCall.classList.remove('d-none');
          hangupCall.classList.add('d-none');
          hangupCall.disabled = true;
          break;
        case 'destroy': // Call has been destroyed
          currentCall = null;
          break;
      }
    }

    /**
     * Make a new outbound call
    */
    function makeCall() {
      const params = {
        destinationNumber: document.getElementById('number').value, // required!
        audio: document.getElementById('audio').checked,
        video: document.getElementById('video').checked ? { aspectRatio: 16/9 } : false,
      };

      currentCall = client.newCall(params);
    }

    /**
     * Hangup the currentCall if present
    */
    function hangup() {
      if (currentCall) {
        currentCall.hangup()
      }
    }

    function saveInLocalStorage(e) {
      var key = e.target.name || e.target.id
      localStorage.setItem('relay.example.' + key, e.target.value);
    }

    // jQuery document.ready equivalent
    function ready(callback) {
      if (document.readyState != 'loading') {
        callback();
      } else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', callback);
      } else {
        document.attachEvent('onreadystatechange', function() {
          if (document.readyState != 'loading') {
            callback();
          }
        });
      }
    }
  </script> --}}
@endpush