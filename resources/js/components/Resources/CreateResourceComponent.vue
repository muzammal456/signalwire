<template>
<div>
    <div class="container">
        <div class="row py-3">
          <div class="col-12 col-md-4">
            <div class="card">
              <div class="card-body">
                <h5>Create Resouce for Calling</h5>
                <div class="form-group">
                  <label for="name">First Name</label>
                  <input type="text" class="form-control" id="name" placeholder="Enter Your First Name" v-model="name">
                </div>
                <button class="btn btn-block btn-success" @click="generateResource()">Generate Resource</button>
                
              </div>
            </div>
          </div>
          
        <a href="/message">Go To Send SMS</a>
        </div>
        
    </div> 

    <calling_component :project_credientials="project_credientials"></calling_component>
</div>
</template>

<script>
    import calling_component from './../CallingComponent';
    export default {
        mounted() {
            console.log('Component mounted.')
        },
        data(){
            return {
                name: '',
                project_credientials: {
                    jwt_token: '',
                    project_id: '' 
                }
            }
        },
        methods:{
            generateResource(){
               
                if(this.name == ''){
                    alert('Please create resource, Add your first name');
                    return false;
                } 
                let data = {
                    "resource": this.name
                }
                let self = this;
                axios.post('/api/generate-resource', data)
                .then(function (response) {
                    self.project_credientials = response.data;
                    self.name = '';
                })
                .catch(function (error) {
                    console.log(error);
                }); 
            }
        },
        components:{
            calling_component
        }
    }
</script>
