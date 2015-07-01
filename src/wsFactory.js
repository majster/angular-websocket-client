'use strict';

(function () {

    angular.module('am.ws', []);

    function wsClient($timeout, $log) {

        var NO_CONNECTION = 0;
        var CONNECTED = 1;
        var CLOSING = 2;
        var CLOSED_OR_COULDNT_OPEN = 3;

        // default options
        var defaults = {
            url: null,
            reconnect: true,
            reconnectIntervalTimeout: 5000,
            callbacks: {}
        };

        return function (_options) {
            // https://docs.angularjs.org/api/ng/function/angular.extend
            var options = angular.extend({}, defaults, _options);
            // this gets populated by WebSocket obj
            var socket = null;

            var subscribers = [];
            var reconnectTimeout = null;


            this.connect = function () {
                if (!options.url) {
                    $log.error('wsClient connection URL not defined!');
                    return;
                }

                connect();
            };

            this.send = function (message) {
                socket.send(message);
            };

            // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
            this.close = function (code, reason) {
                // we don't want to reconnect when manual close
                options.reconnect = false;
                socket.close(code, reason);
            };

            this.subscribe = function (subscriber, callback) {
                $log.debug('new subscriber [' + subscriber + '] to socket [' + options.url + ']');
                subscribers[subscriber] = callback;
            };

            this.unsubscribe = function (subscriber) {
                $log.debug('unsubscribing [' + subscriber + '] from socket [' + options.url + ']');
                delete subscribers[subscriber];
            };

            function connect() {
                socket = new WebSocket(options.url);
                socket.onopen = onOpen;
                socket.onclose = onClose;
                socket.onmessage = onMessage;
                socket.onerror = onError;
            }

            function onOpen(event) {
                $log.debug('wsClient connected to [' + options.url + ']');
                $log.debug(event);
                if (reconnectTimeout) {
                    $timeout.cancel(reconnectTimeout);
                }
            }

            function onClose(event) {
                $log.debug('wsClient connection to [' + options.url + '] closed');
                $log.debug(event);
                if (reconnectTimeout) {
                    $timeout.cancel(reconnectTimeout);
                }
                if (options.reconnect) {
                    $log.debug('wsClient will try to reconnect in [' + options.reconnectIntervalTimeout + '] ms');
                    reconnectTimeout = $timeout(connect, options.reconnectIntervalTimeout);
                }
            }

            function onMessage(event) {
                $log.debug('wsClient connection to [' + options.url + '] message received, will notify listeners');
                $log.debug(event);
                try {
                    if (event && event.data) {
                        // notify subscribes about message
                        angular.forEach(subscribers, function (callback) {
                            callback(JSON.parse(event.data));
                        });
                    }
                } catch (e) {
                    console.error(e);
                }
            }

            function onError(event) {
                $log.debug('wsClient connection to [' + options.url + '] error');
                $log.error(event);
            }
        };
    }

    angular.module('am.ws').factory('wsClient', wsClient);

})();