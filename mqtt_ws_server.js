/*
Copyright 2014 Charalampos Doukas - @buildingiot
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var mqtt = require('mqtt')
var https = require('https');

var MQTT_topic = "";
var MQTT_server = "";
var MQTT_port = 1883;

var WS_port = 8100;

console.log('starting...');
client = mqtt.createClient(MQTT_port, MQTT_server);
client.subscribe(MQTT_topic);

var ws_serverclient;


var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: WS_port});
wss.on('connection', function(ws) {
  ws_serverclient = ws;

  ws.pingssent = 0;

    var id = setInterval(function() {

      //implement a ping to to the web client to make sure the connection is open

      if (ws.pingssent >= 6)   // how many missed pings you will tolerate before assuming connection broken.
          {
              ws.close();
          }
      else
          {
            try {
                   ws.ping();
            }
            catch (e) {
              //console.log('ws.ping failed');
              ws.close();
            }
             
              ws.pingssent++;
          }
    }, 60 * 1000);   //  60 seconds between pings

     ws.on("pong", function() {    // we received a pong from the client.
        ws.pingssent = 0;    // reset ping counter.
    });


    //when a message is received over WebSockets - client has sent something
    ws.on('message', function(message) {
       
        //console.log('message received from web client: '+message);
        //publish it over MQTT
        client.publish(MQTT_topic, message);        
    });
});

client.on('message', function (topic, message) {
    //console.log('message received from mqtt channel: '+message);
    if(ws_serverclient !=null)
      ws_serverclient.send(message);
});
