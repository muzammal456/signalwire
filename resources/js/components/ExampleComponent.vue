<template>
    <div class="container">
        <button @click="create_client()">Create Client</button>
    </div>
</template>

<script>
    // import { Relay } from '@signalwire/js'
    export default {
        mounted() {
            console.log('Component mounted.')
        },
        methods:{
            create_client(){
                console.log('client');
                const client = new Relay({
                    project: 'd96c3f14-c40f-4b4b-bf26-056bcf976d22',
                    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE1OTU4NTExMDQsImlzcyI6IlNpZ25hbFdpcmUgSldUIiwianRpIjoiTkhDVHYtQjBJV3V2X0xMOTM1V1huYjA0dU1RIiwic2NvcGUiOiJ3ZWJydGMiLCJzdWIiOiJkOTZjM2YxNC1jNDBmLTRiNGItYmYyNi0wNTZiY2Y5NzZkMjIiLCJyZXNvdXJjZSI6IjQ0YmI2Y2Y1LTA1NDQtNDIzNC05NzMwLWNlNTRiMTExM2IzMyIsImV4cCI6MTU5NTg1MjAwNH0.CRPQ9jGSfrjSZN2bM2uyEaTexpEeIFtDFw_jQ4CofXQHEtHEqRE-zI2Nd4duZGslzWkK6dVjwLm3Q0s1UCeqQQ',
                });
                
                client.on('signalwire.ready', (client) => {
                   
               })
                client.connect();
                console.log(client);
            }
        }
    }
</script>
