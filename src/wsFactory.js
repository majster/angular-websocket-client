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
            this.options = angular.extend({}, defaults, _options);
            this.subscribers = [];
            this.reconnectTimeout = null;

            // this gets populated by WebSocket obj
            this.socket = null;

            this.connect = function () {
                if (!this.options.url) {
                    $log.error('wsClient connection URL not defined!');
                    return;
                }

                connect();
            };

            this.send = function (message) {
                this.socket.send(message);
            };

            // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
            this.close = function (code, reason) {
                // we don't want to reconnect when manual close
                this.options.reconnect = false;
                this.socket.close(code, reason);
            };

            this.subscribe = function (subscriber, callback) {
                $log.debug('new subscriber [' + subscriber + '] to socket [' + this.options.url + ']');
                this.subscribers[subscriber] = callback;
            };

            this.unsubscribe = function (subscriber) {
                $log.debug('unsubscribing [' + subscriber + '] from socket [' + this.options.url + ']');
                delete this.subscribers[subscriber];
            };

            function connect() {
                this.socket = new WebSocket(this.options.url);
                this.socket.onopen = onOpen;
                this.socket.onclose = onClose;
                this.socket.onmessage = onMessage;
                this.socket.onerror = onError;
            }

            function onOpen(event) {
                $log.debug('wsClient connected to [' + this.options.url + ']');
                if (this.reconnectTimeout) {
                    $timeout.cancel(this.reconnectTimeout);
                }
            }

            function onClose(event) {
                $log.debug('wsClient connection to [' + this.options.url + '] closed');
                if (this.reconnectTimeout) {
                    $timeout.cancel(this.reconnectTimeout);
                }
                if (this.options.reconnect) {
                    $log.debug('wsClient will try to reconnect in [' + this.options.reconnectIntervalTimeout + '] ms');
                    this.reconnectTimeout = $timeout(connect, this.options.reconnectIntervalTimeout);
                }
            }

            function onMessage(event) {
                $log.debug('wsClient connection to [' + this.options.url + '] message received, will notify listeners');
                $log.debug(event);
                if (event && event.data) {
                    // notify subscribers
                    angular.forEach(subscribers, function (callback) {
                        callback(JSON.parse(event.data));
                    });
                }
            }

            function onError(event) {
                $log.debug('wsClient connection to [' + this.options.url + '] error');
                $log.error(event);
            }
        };
    }

    angular.module('am.ws').factory('wsClient', wsClient);

})();