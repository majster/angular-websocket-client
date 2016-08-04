Angular websocket wrapper
=========================

## Why this socket wrapper
- automatic reconnect on fleaky connection (option)
- ping support (option)
- multiple sockets (assign id to each)
- pure angular (including logs)

## Getting started

### Usage

- add `websocket.wrapper` module to your application module dependencies

```javascript
angular.module('myApp', ['websocket.wrapper', ...]);
```

- create ws client
    
```javascript
    
    function myWSClient(websocketWrapper){
        myWSClient.start = function(){
            var options = {
                url: 'wss://...',
                id: 'mySocket1'
            };
            
            myWSClient.socket = new websocketWrapper(options);
        };
        
        return myWSClient;
    }
    
    angular.module('myApp').factory('myWSClient', myWSClient);
    
```    

- use client

```javascript

    angular.module('myApp').controller('myCtrl', function($scope, myWSClient){
         
        myWSClient.start();
        
        $scope.$on(myWSClient.socket.onOpenBroadcastEvent, function(event, message){
            
            message = JSON.parse(message);
            
            console.log(message);
        });
        
        $scope.$on(myWSClient.socket.onErrorBroadcastEvent, function(event, message){
            
            message = JSON.parse(message);
            
            console.log(message);
        }); 
        
        $scope.$on(myWSClient.socket.onCloseBroadcastEvent, function(event, message){
            
            message = JSON.parse(message);
            
            console.log(message);
        });
        
        $scope.$on(myWSClient.socket.onMessageBroadcastEvent, function(event, message){
            
            message = JSON.parse(message);
            
            console.log(message);
        });
        
        
    });

```

### Broadcasted events
Are constricted from socket options ID.
- onMessageBroadcastEvent = options.id + '_message';
- onOpenBroadcastEvent = options.id + '_opened';
- onErrorBroadcastEvent = options.id + '_error';
- onCloseBroadcastEvent = options.id + '_closed';
- onSendFailedBroadcastEvent = options.id + '_send_failed';
  
### API

| Method        | Definition    | 
| :----------- |:-------------:| 
| send          | Send message down the socket.            | 
| close         | Close socket connection manualy              | 

### Options

| Option | Description | Default |
|:------|:-------|:--------|
|url| Url to connect to| null|
|id| Id for multiple sockets|'websocket'|
|onOpenBroadcast| Broadcasted event on soket open| true|
|onErrorBroadcast| Broadcasted event on socket error| true|
|onCloseBroadcast| Broadcasted event on socket close|true|
|onFailedSendBroadcast| Broadcasted event on socket faild send message| true|
|reconnect| Reconnect socket if connection not closed manualy| true|
|reconnectIntervalTimeout| Try reconnection every [n] ms| 5000|
|keepAlive| Send keepalive pings | false|
|keepAliveMessage| Keepalive ping message| '{ping:true}'|
|keepAliveIntervalTime| Send keepalive every [n] ms|10000|
|onMessageBroadcastOnlyData| Unwrap message from data.| true|

## TODO
- tests