'use strict';

(function () {

    angular.module('am.ws', []);

    function wsFactory($timeout, $log) {

        var NO_CONNECTION = 0;
        var CONNECTED = 1;
        var CLOSING = 2;
        var CLOSED_OR_COULDNT_OPEN = 3;

        wsFactory.initWsClient = function (options) {
            var wsClient = {};
            var reconnectTimeout = null;
            var subscribers = [];

            // this gets populated by WebSocket obj
            wsClient.socket = null;
            wsClient.options = {};

            // default options
            wsClient.defaults = {
                url: null,
                reconnect: true,
                reconnectIntervalTimeout: 5000,
                callbacks: {}
            };

            // https://docs.angularjs.org/api/ng/function/angular.extend
            wsClient.options = angular.extend({}, wsClient.defaults, options);
            if (!wsClient.options.url) {
                $log.error('wsClient connection URL not defined!');
                return;
            }

            connect();

            wsClient.send = function (message) {
                wsClient.socket.send(message);
            };

            // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
            wsClient.close = function (code, reason) {
                // we don't want to reconnect when manual close
                wsClient.options.reconnect = false;
                wsClient.socket.close(code, reason);
            };

            wsClient.subscribe = function (subscriber, callback) {
                $log.debug('new subscriber [' + subscriber + '] to socket [' + wsClient.options.url + ']');
                subscribers[subscriber] = callback;
            };

            wsClient.unsubscribe = function (subscriber) {
                $log.debug('unsubscribing [' + subscriber + '] from socket [' + wsClient.options.url + ']');
                delete subscribers[subscriber];
            };

            function connect() {
                wsClient.socket = new WebSocket(wsClient.options.url);
                wsClient.socket.onopen = onOpen;
                wsClient.socket.onclose = onClose;
                wsClient.socket.onmessage = onMessage;
                wsClient.socket.onerror = onError;
            }

            function onOpen(event) {
                $log.debug('wsClient connected to [' + wsClient.options.url + ']');
                if (reconnectTimeout) {
                    $timeout.cancel(reconnectTimeout);
                }
            }

            function onClose(event) {
                $log.debug('wsClient connection to [' + wsClient.options.url + '] closed');
                if (reconnectTimeout) {
                    $timeout.cancel(reconnectTimeout);
                }
                if (wsClient.options.reconnect) {
                    $log.debug('wsClient will try to reconnect in [' + wsClient.options.reconnectIntervalTimeout + '] ms');
                    reconnectTimeout = $timeout(connect, wsClient.options.reconnectIntervalTimeout);
                }
            }

            function onMessage(event) {
                $log.debug('wsClient connection to [' + wsClient.options.url + '] message received, will notify listeners');
                $log.debug(event);
                if (event && event.data) {
                    // notify subscribers
                    angular.forEach(subscribers, function (callback) {
                        callback(JSON.parse(event.data));
                    });
                }
            }

            function onError(event) {
                $log.debug('wsClient connection to [' + wsClient.options.url + '] error');
                $log.error(event);
            }

            return wsClient;
        };

        return wsFactory;
    }

    angular.module('am.ws').factory('wsFactory', wsFactory);

})();