<template>
    <div class="container">
        <div class="row py-3">
          <div class="col-12 col-md-4">
            <div class="card">
              <div class="card-body">
                <h5>Connect</h5>
                <div class="form-group">
                  <label for="project">Project</label>
                  <input type="text" class="form-control" id="project" placeholder="Enter Project ID" @click="saveInLocalStorage()" v-model="project_credientials.project_id">
                </div>
                <div class="form-group">
                  <label for="token">Token</label>
                  <input type="text" class="form-control" id="token" placeholder="Enter your JWT"  v-model="project_credientials.jwt_token" >
                </div>
                <button id="btnConnect" class="btn btn-block btn-success"  :class="connected_button ? '' : 'd-none'" @click="connect()">Connect</button>
                <button id="btnDisconnect" class="btn btn-block btn-danger" :class="dis_connected_button ? '' : 'd-none'" @click="disconnect()">Disconnect</button>
    
                <div class="text-center mt-3 text-muted">
                <small>Status: <span id="connectStatus">Not Connected</span></small>
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
              <input type="text" class="form-control" id="number" v-model="dialer" placeholder="Enter Resource or Number to Dial" >
            </div>
            <div>Call Options:</div>
            <div class="form-check">
              <input type="checkbox" id="audio" value="1" checked>
              <label class="form-check-label" for="audio">
                Include Audio
              </label>
            </div>
            <div class="form-check">
              <input type="checkbox" id="video" value="1" checked >
              <label class="form-check-label" for="video">
                Include Video
              </label>
            </div>
            <button id="startCall" class="btn btn-primary px-5 mt-4"  @click="makeCall()" :disabled="connected_call == 0" >Call</button>
            <button id="hangupCall" class="btn btn-danger px-5 mt-4" :class="hang_call_display == 0 ? '' : 'd-none'"  @click="hangup()" :disabled="hang_call == 0">Hang up</button>
          </div>
        </div> 
    </div>
</template> 
<script>
    import { Relay } from '@signalwire/js'
    export default {
        props: ['project_credientials'],
        mounted() {
            console.log('Component mounted.') 
        },
        data(){
            return {
                currentCall: null,
                connectStatus: 'Not Connected',
                connected_call: 0,
                connected_button: true,
                dis_connected_button: false,
                client: null,
                dialer: '',
                hang_call: 1,
                hang_call_display: 1
            }
        },

        
        
        methods:{
            connect(){ 
                let self = this;
                
                self.client = new Relay({
                    project: 'd96c3f14-c40f-4b4b-bf26-056bcf976d22',
                    token: this.project_credientials.jwt_token,
                });
                self.client = this.checkDevices(self.client);
            
                self.client.on('signalwire.ready', function() {
                    console.log("READY STATE");
                    // this.connected_button = false;
                    // this.dis_connected_button = true;
                    // this.connectStatus = 'Connected';
                    // this.connected_call = 1;

                    btnConnect.classList.add('d-none');
                    btnDisconnect.classList.remove('d-none');
                    connectStatus.innerHTML = 'Connected';

                    startCall.disabled = false;
                    
                }); 
                
                // Update UI on socket close
                self.client.on('signalwire.socket.close', function() {
                    // this.connected_button = true;
                    // this.dis_connected_button = false;
                    // this.connectStatus = 'DisConnected';
                    btnConnect.classList.remove('d-none');
                    btnDisconnect.classList.add('d-none');
                    connectStatus.innerHTML = 'Disconnected';
                });

                // Handle error...
                self.client.on('signalwire.error', function(error){
                    console.log("ERROR STATE");
                    console.error("SignalWire error:", error);
                });  

                self.client.on('signalwire.notification', self.handleNotification);
                // this.connectStatus = 'Connecting...';
                connectStatus.innerHTML = 'Connecting...';
                
                self.client.connect();

                return self.client;

            },
            checkDevices(client){
                client.remoteElement = 'remoteVideo';
                client.localElement = 'localVideo';
                client.iceServers = [{ urls: ['stun:localhost:8000'] }];
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
                return client;
            },
            saveInLocalStorage(){
                console.log("SAVE IN LOCAL STORAGE");
            },
  
            async makeCall(){
                let self = this;
                const params = {
                    destinationNumber: this.dialer, // required!
                    audio: document.getElementById('audio').checked,
                    video: document.getElementById('video').checked ? { aspectRatio: 16/9 } : false,
                };
                console.log(params);
                self.currentCall = self.client.newCall(params);
            },
            async handleNotification(notification){
                let self = this;
                switch (notification.type) {
                    case 'callUpdate':
                    self.handleCallUpdate(notification.call);
                    break;
                    case 'userMediaError': 
                    break;
                }
            },
            hangup() {
                let self = this;
                if (self.currentCall) {
                    self.currentCall.hangup()
                }
            },
            async handleCallUpdate(call){
                console.log("CALL UPDATE");
                console.log(call.state);
                let self = this;
                self.currentCall = call; 
                switch (call.state) {
                    case 'new': // Setup the UI
                        break;
                    case 'trying': // You are trying to call someone and he's ringing now
                        break;
                    case 'recovering': // Call is recovering from a previous session
                    if (confirm('Recover the previous call?')) {
                        self.currentCall.answer();
                    } else {
                        self.currentCall.hangup();
                    }
                    break;
                    case 'ringing': // Someone is calling you
                    if (confirm('Pick up the call?')) {  
                        self.currentCall.answer();
                    } else {
                        self.currentCall.hangup();
                    } 
                    break;
                    case 'active': // Call has become active
                    startCall.classList.add('d-none');
                    hangupCall.classList.remove('d-none');
                    // this.connected_call = 1;
                    // this.hang_call_display = 1;

                    break;
                    case 'hangup': // Call is over
                    startCall.classList.remove('d-none');
                    hangupCall.classList.add('d-none');
                    // this.connected_call = 0;
                    // this.hang_call_display = 1;
                    
                    // hangupCall.disabled = true;
                    break;
                    case 'destroy': // Call has been destroyed
                    self.currentCall = null;
                    break;
                }

            },

            
        },
      
    }
</script>
