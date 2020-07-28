<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel') }}</title>

    <!-- Scripts -->
    <script src="{{ asset('js/app.js') }}" defer></script>

    <!-- Fonts -->
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet">

    <!-- Styles -->
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
</head>
<body>
    <div id="app">
        <nav class="navbar navbar-expand-md navbar-light bg-white shadow-sm">
            <div class="container">
                <a class="navbar-brand" href="{{ url('/') }}">
                    {{ config('app.name', 'Laravel') }}
                </a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="{{ __('Toggle navigation') }}">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <!-- Left Side Of Navbar -->
                    <ul class="navbar-nav mr-auto">

                    </ul>

                    <!-- Right Side Of Navbar -->
                    <ul class="navbar-nav ml-auto">
                        <!-- Authentication Links -->
                        @guest
                            <li class="nav-item">
                                <a class="nav-link" href="{{ route('login') }}">{{ __('Login') }}</a>
                            </li>
                            @if (Route::has('register'))
                                <li class="nav-item">
                                    <a class="nav-link" href="{{ route('register') }}">{{ __('Register') }}</a>
                                </li>
                            @endif
                        @else
                            <li class="nav-item dropdown">
                                <a id="navbarDropdown" class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" v-pre>
                                    {{ Auth::user()->name }} <span class="caret"></span>
                                </a>

                                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                                    <a class="dropdown-item" href="{{ route('logout') }}"
                                       onclick="event.preventDefault();
                                                     document.getElementById('logout-form').submit();">
                                        {{ __('Logout') }}
                                    </a>

                                    <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
                                        @csrf
                                    </form>
                                </div>
                            </li>
                        @endguest
                    </ul>
                </div>
            </div>
        </nav>

        <main class="py-4">
            @yield('content')
        </main>
    </div>
</body>
</html>

   
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
  </script>