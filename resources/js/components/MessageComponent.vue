<template>
    <div>
        <div class="container">
            <div class="row py-3">
              <div class="col-12 col-md-4">
                <div class="card">
                  <div class="card-body">
                    <div class="alert alert-success" role="alert" v-if="success">
                        Message Send Successfully
                    </div>
                    
                    <div class="alert alert-danger" role="alert" v-if="danger">
                        Message Send Failed
                    </div>

                    <h5>Send SMS:</h5>
                    <div class="form-group">
                      <label for="name">To</label>
                      <input type="number" class="form-control" id="to" placeholder="Enter Number" v-model="message.to">
                    </div>
                    
                    <div class="form-group">
                        <label for="name">Message</label>
                        <input type="text" class="form-control" id="message" placeholder="Enter Message" v-model="message.body">
                      </div>
                    <button class="btn btn-block btn-success" @click="sendSMS()">Send SMS</button>
                    
                  </div>
                </div>
              </div>
              <a href="/">Go To Home</a>
            </div>

        </div> 
    </div>
</template>

<script> 
    export default {
        mounted() {
            console.log('Component mounted.')
        },
        data(){
            return {
                message:{
                    to: '',
                    body: ''
                },
                success: false,
                danger: false
            }
        },
        methods:{
            sendSMS(){
                let self = this;
                axios.post('/api/message', this.message)
                .then(res => {
                    self.message.to = '';
                    self.message.body = '';
                    self.danger = false;
                    self.success = true;
                    
                })
                .catch(error => {
                    self.success = false;
                    self.danger = true;
                    console.log(error);
                })
            }
        }
    }
</script>
