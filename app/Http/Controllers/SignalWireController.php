<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use SignalWire\Rest\Client;
class SignalWireController extends Controller
{
    public function createResource(Request $request){
     
        $resource = $request->resource;

        $fields = '{"expires_in":10000, "resource": '.$resource.'}';
        $headers = [ 
            'Content-Type: application/json'
        ];
        $project_id     = config('signal_wire_api.signal_wire.project_id'); 
        $token          = config('signal_wire_api.signal_wire.token');
        $space_url      = config('signal_wire_api.signal_wire.space_url'); 
             
        $url = 'https://'.$space_url.'/api/relay/rest/jwt';
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_POST, 1); 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        curl_setopt($ch, CURLOPT_USERPWD, "$project_id:$token");
        $result = curl_exec($ch);
        curl_close($ch);  
        $result = json_decode($result);
        
        $data['jwt_token'] = $result->jwt_token;
        $data['project_id'] = $project_id;
        return $data;
    }
    public function message(){
        return view('message');
    }
    public function sendMessage(Request $request){
    
        $project_id     = config('signal_wire_api.signal_wire.project_id');
        $token          = config('signal_wire_api.signal_wire.token');
        $space_url      = config('signal_wire_api.signal_wire.space_url'); 
        $client         = new Client($project_id, $token, array("signalwireSpaceUrl" => $space_url));
        $from             = '+16623628302';
        $message        = $client->messages
                            ->create("+".$request->to, // to
                                    array("from" => $from, "body" => $request->body)
                            );

       return $message;
    }
}
