Angular websocket factory
=========================

`am-websocket-factory` is intended to have subscribers to socket, and multiple clients.

## Getting started

### Usage

- add `am-ws` module to your application module dependencies

```javascript
angular.module('myApp', ['am-ws', ...]);
```

- create ws client
    
```javascript
angular.module('myApp').service('myWsClient', function(wsFactory){
    var options = {
        url: 'ws://localohost:5678'
    };
    this.socket = wsFactory.initWsClient(options);
});
```    

- use client

```javascript
angular.module('myApp').controller('myCtrl', function(myWsClient, $log){
    myWsClient.socket.subscribe('mySubscription', function(message){
        $log.debug(message);
    });
    myWsClient.socket.send(JSON.stringify({text: 'hello'}));
    myWsClient.socket.unsubscribe('mySubscription');
    myWsClient.socket.close();
});
```   
  
### API

| Method        | Def           | 
| :-----------: |:-------------:| 
| connect       |               | 
| send          |               | 
| close         |               | 
| subscribe     |               | 
| unsubscribe   |               | 