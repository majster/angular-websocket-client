'use strict';

(function () {

    angular.module('am.ws', []);

    /**
     * wsClient object
     * @param $log
     * @param $interval
     * @returns {Function}
     */
    function wsClient($log, $interval) {

        // default options
        var defaults = {
            url: null,
            reconnect: true,
            reconnectIntervalTimeout: 5000,
            callbacks: {},
            keepAlive: false,
            keepAliveMessage: '{ping:true}',
            keepAliveIntervalTime: 10000
        };

        return function (_options) {
            // https://docs.angularjs.org/api/ng/function/angular.extend
            var options = angular.extend({}, defaults, _options);
            // this gets populated by WebSocket obj
            var socket = null;
            // subscribers object to hold references to callback functions
            var subscribers = {};
            // reference to $interval for reconnection
            var reconnectInterval = null;
            // interval for checking connection
            var keepAliveInterval = null;

            var that = this;

            /**
             * Function tries to establish connection to socket url
             */
            this.connect = function () {
                if (!options.url) {
                    $log.error('wsClient connection URL not defined!');
                    return;
                }

                connect();
            };

            /**
             * Function for sending message to socket
             * @param message
             */
            this.send = function (message) {
                // TODO: stack messages if not connected
                if (socket && socket.readyState === that.CONNECTION_STATE_CONNECTED) {
                    socket.send(message);
                } else {
                    $log.error('wsClient not connected. Message not sent.');
                }
            };

            /**
             * Function for closing connection
             *
             * https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
             * @param code
             * @param reason
             */
            this.close = function (code, reason) {
                // we don't want to reconnect when manual close
                options.reconnect = false;
                socket.close(code, reason);
            };

            /**
             * Function for tracking subscribers to socket messages.
             * User responsible for unsubscribing (reference cleanup)
             * @param subscriber
             * @param callback
             */
            this.subscribe = function (subscriber, callback) {
                $log.debug('new subscriber [' + subscriber + '] to socket [' + options.url + ']');
                subscribers[subscriber] = callback;
            };

            /**
             * Function for unsubscribing from socket messages
             * @param subscriber
             */
            this.unsubscribe = function (subscriber) {
                $log.debug('unsubscribing [' + subscriber + '] from socket [' + options.url + ']');
                delete subscribers[subscriber];
            };

            /**
             * The readonly attribute readyState represents the state of the connection. It can have the following values:
             *
             * - A value of 0 indicates that the connection has not yet been established.
             * - A value of 1 indicates that the connection is established and communication is possible.
             * - A value of 2 indicates that the connection is going through the closing handshake.
             * - A value of 3 indicates that the connection has been closed or could not be opened.
             *
             * @returns {boolean}
             * @private
             */
            this.connectionState = function () {
                if (socket) {
                    return socket.readyState;
                } else {
                    return undefined;
                }
            };

            this.CONNECTION_STATE_NO_CONNECTION = 0;
            this.CONNECTION_STATE_CONNECTED = 1;
            this.CONNECTION_STATE_CLOSING = 2;
            this.CONNECTION_STATE_CLOSED_OR_COULDNT_OPEN = 3;

            /**
             * Setup new WebSocket object
             */
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
                if (options.callbacks.onOpen) {
                    options.callbacks.onOpen();
                }

                // no need for reconnecting
                if (reconnectInterval) {
                    $interval.cancel(reconnectInterval);
                    reconnectInterval = null;
                }

                // start service to check connection (fake ping pong)
                // http://www.w3.org/TR/2011/CR-websockets-20111208/#ping-and-pong-frames
                if (options.keepAlive && !keepAliveInterval) {
                    $log.debug('wcClient keep alive is up. will send ping \'options.keepAliveMessage\': [' + options.keepAliveMessage + '] every \'options.keepAliveIntervalTime\': [' + options.keepAliveIntervalTime + '] ms');
                    keepAliveInterval = $interval(function () {
                        that.send(options.keepAliveMessage);
                    }, options.keepAliveIntervalTime);
                }
            }

            function onClose(event) {
                $log.debug('wsClient connection to [' + options.url + '] closed');
                $log.debug(event);
                if (options.callbacks.onClose) {
                    options.callbacks.onClose();
                }

                // no need for this if disconnected
                if (keepAliveInterval) {
                    $interval.cancel(keepAliveInterval);
                    keepAliveInterval = null;
                }

                // try to reestablish connection
                if (options.reconnect && !reconnectInterval) {
                    $log.debug('wsClient will try to reconnect in [' + options.reconnectIntervalTimeout + '] ms');
                    reconnectInterval = $interval(connect, options.reconnectIntervalTimeout);
                }
            }

            function onMessage(event) {
                $log.debug('wsClient connection to [' + options.url + '] message received, will notify [' + subscribers.length + '] subscribers');
                $log.debug(event);
                if (event && event.data) {
                    // notify subscribes about message
                    angular.forEach(subscribers, function (callback) {
                        callback(JSON.parse(event.data));
                    });
                }
            }

            function onError(event) {
                $log.debug('wsClient connection to [' + options.url + '] error');
                $log.error(event);
                if (options.callbacks.onError) {
                    options.callbacks.onError();
                }
            }
        };
    }

    angular.module('am.ws').factory('wsClient', wsClient);

})();