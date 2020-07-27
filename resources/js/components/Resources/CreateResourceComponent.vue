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
                    jwt_token: 'd96c3f14-c40f-4b4b-bf26-056bcf976d22',
                    project_id: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE1OTU4NDY0OTYsImlzcyI6IlNpZ25hbFdpcmUgSldUIiwianRpIjoiWklhd09HSDg2UXlBZURDSFh2enZvUXZSdlNVIiwic2NvcGUiOiJ3ZWJydGMiLCJzdWIiOiJkOTZjM2YxNC1jNDBmLTRiNGItYmYyNi0wNTZiY2Y5NzZkMjIiLCJyZXNvdXJjZSI6Ijk1NTIzMzVkLWZhNmEtNDYzYi1iZGNiLWZlZGNjYWVhMGQyMyIsImV4cCI6MTU5NTg0NzM5Nn0.kcglF7uWsUs32xw7dw0gpv7nwyd828w078IJYyrYRVTCzoYGrQ7fMazyeJADqmy9CsrxxfD4JjQF-2j9tJn9NQ' 
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
