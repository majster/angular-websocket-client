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
angular.module('myApp').service('myWsClient', function(wsClient){
    var options = {
        url: 'ws://localohost:5678'
    };
    this = new wsClient(options);
});
```    

- use client

```javascript
angular.module('myApp').controller('myCtrl', function(myWsClient, $log){
    myWsClient.subscribe('mySubscription', function(message){
            $log.debug(message);
        });
    myWsClient.connect();
    myWsClient.send(JSON.stringify({text: 'hello'}));
    myWsClient.unsubscribe('mySubscription');
    myWsClient.close();
});
```   
  
### API

| Method        | Definition    | 
| :-----------: |:-------------:| 
| connect       |               | 
| send          |               | 
| close         |               | 
| subscribe     |               | 
| unsubscribe   |               | 

### Options

| Option | Default |
|:------:|:--------|
| url | null |
| reconnect | true |
| reconnectIntervalTimeout | 5000 |