<template>
    <div class="container">
        <button @click="create_client()">Create Client</button>
    </div>
</template>

<script>
    import { Relay } from '@signalwire/js'
    export default {
        mounted() {
            console.log('Component mounted.')
        },
        methods:{
            create_client(){
                const client = new Relay({
                    project: 'd96c3f14-c40f-4b4b-bf26-056bcf976d22',
                    token: 'PT8b1a2a36df76bb0b32b371e09d666fa9b1520f30d9db5204',
                });
                client.on('signalwire.ready', (client) => {
                   
               })
                client.connect();
            }
        }
    }
</script>
