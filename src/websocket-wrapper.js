(function () {
    'use strict';

    angular.module('websocket.wrapper', []);

    function websocketWrapper($log, $interval, $rootScope) {

        websocketWrapper = function (_options) {

            var that = this;

            var defaults = {
                url: null,
                id: 'websocket',
                onOpenBroadcast: true,
                onErrorBroadcast: true,
                onCloseBroadcast: true,
                onFailedSendBroadcast: true,
                reconnect: true,
                reconnectIntervalTimeout: 5000,
                keepAlive: false,
                keepAliveMessage: '{ping:true}',
                keepAliveIntervalTime: 10000,
                onMessageBroadcastOnlyData: true
            };

            var options = angular.extend({}, defaults, _options);
            var reconnectInterval = null;
            var keepAliveInterval = null;

            that.onMessageBroadcastEvent = options.id + '_message';
            that.onOpenBroadcastEvent = options.id + '_opened';
            that.onErrorBroadcastEvent = options.id + '_error';
            that.onCloseBroadcastEvent = options.id + '_closed';
            that.onSendFailedBroadcastEvent = options.id + '_send_failed';

            that.socket = null;

            /*
             * - A value of 0 indicates that the connection has not yet been established.
             * - A value of 1 indicates that the connection is established and communication is possible.
             * - A value of 2 indicates that the connection is going through the closing handshake.
             * - A value of 3 indicates that the connection has been closed or could not be opened.
             *
             */
            that.states = {
                CONNECTION_STATE_NO_CONNECTION: 0,
                CONNECTION_STATE_CONNECTED: 1,
                CONNECTION_STATE_CLOSING: 2,
                CONNECTION_STATE_CLOSED_OR_COULDNT_OPEN: 3
            };

            that.connect = function () {
                that.socket = new WebSocket(options.url);
                that.socket.onopen = onOpen;
                that.socket.onclose = onClose;
                that.socket.onmessage = onMessage;
                that.socket.onerror = onError;
            };

            that.connect();

            that.close = function (code, reason) {
                if (!code) {
                    code = 1000;
                }
                // we don't want to reconnect when manual close
                options.reconnect = false;
                that.socket.close(code, reason);
            };

            that.send = function (message) {
                if (that.socket && that.socket.readyState === that.states.CONNECTION_STATE_CONNECTED) {
                    that.socket.send(message);
                } else {
                    $log.error('Socket to [%s] not connected. Message not sent.', options.url);
                    if (options.onFailedSendBroadcast) {
                        $rootScope.$broadcast(that.onSendFailedBroadcastEvent);
                    }
                }
            };

            function onOpen(event) {
                $log.debug('Socked opened to [%s]', options.url);
                $log.debug(event);
                if (options.onOpenBroadcast) {
                    $rootScope.$broadcast(that.onOpenBroadcastEvent, event);
                }
                if (reconnectInterval) {
                    $interval.cancel(reconnectInterval);
                    reconnectInterval = null;
                }

                // start service to check connection (fake ping pong)
                // http://www.w3.org/TR/2011/CR-websockets-20111208/#ping-and-pong-frames
                if (options.keepAlive && !keepAliveInterval) {
                    $log.debug('Socket keepAlive is up for [%s]. Will send ping [%s] every [%s] ms.',options.url, options.keepAliveMessage, options.keepAliveIntervalTime);
                    keepAliveInterval = $interval(function () {
                        that.send(options.keepAliveMessage);
                    }, options.keepAliveIntervalTime);
                }
            }

            function onClose(event) {
                $log.debug('Socket connection to [%s] closed.', options.url);
                $log.debug(event);
                if (options.onCloseBroadcast) {
                    $rootScope.$broadcast(that.onCloseBroadcastEvent, event);
                }

                // no need for this if disconnected
                if (keepAliveInterval) {
                    $interval.cancel(keepAliveInterval);
                    keepAliveInterval = null;
                }

                // try to reestablish connection
                if (options.reconnect) {
                    if (reconnectInterval) {
                        $log.debug('Socket to [%s] will try to reconnect in [%s] ms.', options.url, options.reconnectIntervalTimeout);
                        reconnectInterval = $interval(that.connect, options.reconnectIntervalTimeout);
                    }
                } else {
                    // clear interval if reconnect disabled or connection never happened and was closed.
                    $interval.cancel(reconnectInterval);
                }
            }

            function onMessage(event) {
                $log.debug('Socket connection to [%s] message received.', options.url);
                $log.debug(event);
                if (options.onMessageBroadcastOnlyData) {
                    if (event && event.data) {
                        $rootScope.$broadcast(that.onMessageBroadcastEvent, event.data);
                    }
                } else {
                    $rootScope.$broadcast(that.onMessageBroadcastEvent, event);
                }
            }

            function onError(event) {
                $log.debug('Socket connection to [%s] error.', options.url);
                $log.error(event);
                if (options.onErrorBroadcast) {
                    $rootScope.$broadcast(that.onErrorBroadcastEvent, event);
                }
            }
        };

        return websocketWrapper;
    }

    angular.module('websocket.wrapper').factory('websocketWrapper', websocketWrapper);

})();