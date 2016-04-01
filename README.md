Angular websocket wrapper
=========================

## Getting started

### Usage

- add `websocket.wrapper` module to your application module dependencies

```javascript
angular.module('myApp', ['websocket.wrapper', ...]);
```

- create ws client
    
```javascript
    var WebsocketsClient = function (websocketWrapper) {

        var options = {
            url: 'wss://localhost:58443/Game?id=gui'
        };
        WebsocketsClient.client = new websocketWrapper(options);

        return WebsocketsClient;

    };

    angular.module('myApp').factory('WebsocketsClient', WebsocketsClient);
```    

- use client

```javascript
angular.module('myApp').controller('myCtrl', function($scope, WebsocketsClient, $log, $rootScope){
         
            WebsocketsClient.init();
            $rootScope.$on(WebsocketsClient.socket.onMessageBroadcastEvent, function(event, message){
                //
            });

            // clean references
            $scope.$on('$destroy', function(){
                WebsocketsClient.socket.close();
            });
});
```
  
### API

| Method        | Definition    | 
| :----------- |:-------------:| 
| send          |               | 
| close         |               | 

### Options

| Option | Default |
|:------|:--------|
|url| null|
|id| 'websocket'|
|onOpenBroadcast| true|
|onErrorBroadcast| true|
|onCloseBroadcast| true|
|onFailedSendBroadcast| true|
|reconnect| true|
|reconnectIntervalTimeout| 5000|
|keepAlive| false|
|keepAliveMessage| '{ping:true}'|
|keepAliveIntervalTime| 10000|
|onMessageBroadcastOnlyData| true|