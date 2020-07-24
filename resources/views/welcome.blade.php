<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Signal Wire</title>

        <link href="https://fonts.googleapis.com/css?family=Nunito:200,600" rel="stylesheet">
        {{-- <link href="{{ asset('css/app.css') }}" rel="stylesheet"> --}}

        <!-- Cross Browser WebRTC Adapter -->
        <script type="text/javascript" src="https://webrtc.github.io/adapter/adapter-latest.js"></script>

        <!-- Include the SignalWire Relay JS SDK -->
        <script type="text/javascript" src="https://unpkg.com/@signalwire/js"></script>

        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" />
        <link rel="shortcut icon" href="https://signalwire.com/assets/images/favicon.ico" />

    </head>
    <body>
        <div id="app">
            @yield('content')
            @stack('scripts')
            {{-- <example-component></example-component> --}}
        </div> 
        {{-- <script src="{{ asset('js/app.js') }}" defer></script> --}}
    </body>
</html>
