@extends('welcome')
@section('content')
{{-- <example-component></example-component>  --}}
<create-resource-component></create-resource-component>
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
 
@endpush