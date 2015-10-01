Angular websocket factory
=========================

Websocket client factory is intended to have subscribers to socket, and multiple clients.

## Getting started

### Usage

- add `am-ws` module to your application module dependencies

```javascript
angular.module('myApp', ['am-ws', ...]);
```

- create ws client
    
```javascript
    var WebsocketsClient = function (wsClient) {

        var options = {
            url: 'wss://localhost:58443/Game?id=gui'
        };
        var client = new wsClient(options);

        return {
            init: function () {
                client.connect();
            },
            send: function (message) {
                client.send(message);
            },
            disconnect: function () {
                client.close(1000);
            },
            subscribe: function (subscriber, callback) {
                client.subscribe(subscriber, callback);
            },
            unsubscribe: function () {
                client.unsubscribe();
            },
            connection: function(){
                return client.connectionState();
            }
        };

    };

    angular.module('myApp').factory('WebsocketsClient', WebsocketsClient);

```    

- use client

```javascript
angular.module('myApp').controller('myCtrl', function($scope, WebsocketsClient, $log){
            // lets subscribe to websockets messages
            WebsocketsClient.subscribe('MyKeyForThisSubcription', _printerCallback);
            WebsocketsClient.init();

            // clean references
            $scope.$on('$destroy', function(){
                WebsocketsClient.unsubscribe('clientBoot');
            });
});
```
```javascript
        // You can add snipet to run method for socket responsible cleanup
        // socket clean up
        $window.onbeforeunload = function () {
            WebsocketsClient.close();
        };```
  
### API

| Method        | Definition    | 
| :----------- |:-------------:| 
| connect       |               | 
| send          |               | 
| close         |               | 
| subscribe     |               | 
| unsubscribe   |               | 
| connectionState   |               | 

### Options

| Option | Default |
|:------|:--------|
            |url| null|
            |reconnect| true|
            |reconnectIntervalTimeout| 5000|
            |callbacks| {}|
            |keepAlive| false|
            |keepAliveMessage| '{ping:true}'|
            |keepAliveIntervalTime| 10000|

### Callbacks
Callback functions are called by reference, so cleanup mandatory to avoid memory leak.