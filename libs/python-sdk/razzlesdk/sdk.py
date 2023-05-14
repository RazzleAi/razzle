import inspect
from decorators import *
from typing import Callable
import os
import websocket
from threading import Thread, Timer
import time
import rel
from razzle_types import RazzleResponse, RazzleResponseWithActionArgs
import json


class RazzleProps(object):

    def __init__(self, appId: str, apiKey: str, requiresAuth: bool, modules: list[object] = [], promptHandler: Callable[[str], RazzleResponse] = None) -> None:
        self.appId = appId
        self.apiKey = apiKey
        self.requiresAuth = requiresAuth
        self.modules = modules
        self.promptHandler = promptHandler


class Razzle(object):

    def __init__(self, props: RazzleProps) -> None:
        self.props = props
        self.server = RazzleServer(
            props.appId, props.apiKey, props.promptHandler, self.onConnected)
        self.actionHandlers = list()

    def onConnected(self):
        self.syncApp()

    def syncApp(self):
        payload = self._buildSyncPayload()
        request = {
            'event': 'SyncApp',
            'data': {
                'payload': payload
            }
        }
        self.server.send(request)

    def _buildSyncPayload(self):
        return {
            'sdkVersion': '0.0.1',
            'actions': [],
            'requiresAuth': self.props.requiresAuth,
        }

    # def initHandlers(self):
    #     modules = self.props.modules
    #     for module in modules:
    #         for name, value in inspect.getmembers(module):
    #             pass
    #     pass


class RazzleServer(object):

    def __init__(self, appId, apiKey, promptHandler: Callable[[str], None] = None, onConnected: Callable[[], None] = None):
        self.appId = appId
        self.apiKey = apiKey
        self.onConnected = onConnected
        self.promptHandler = promptHandler
        self.isConnected = False
        self._connect()

    def _connect(self):
        wsUrl = os.environ.get('RAZZLE_WS_URL')
        if wsUrl is None:
            wsUrl = 'wss://api.razzle.ai/agent'
        websocket.enableTrace(True)
        self.ws = websocket.WebSocketApp(
            wsUrl,
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close,
            on_open=self.on_open,
        )
        self.ws.ping_interval = 10
        self.ws.ping_payload = 'ping'
        self.ws.run_forever(dispatcher=rel, reconnect=3)

    def on_open(self, ws: websocket.WebSocketApp):
        def notify_callback():
            if self.onConnected is not None:
                self.onConnected()

        timer = Timer(1, notify_callback)
        timer.start()
        self.isConnected = True
        # send pings at intervals
        self.sendPings(ws)

    def sendPings(self, ws: websocket.WebSocketApp):
        def run(*args):
            while self.isConnected:
                time.sleep(10)
                ws.send('ping')
        Thread(target=run).start()

    def on_message(self, ws, message):
        try:
            msg_json = json.loads(message)
        except:
            return
        
        print(f'WS message received: {message}')
        type = msg_json.get('event')
        data = msg_json.get('data')

        if type == 'CallFunction':
            callFuncResp = self._handleCallFunction(data)

    def on_error(self, ws, error):
        print(f'WS error occurred: {error}')

    def on_close(self, ws, close_status_code, close_msg):
        print(
            f'WS connection closed: code: {close_status_code} msg: {close_msg}')
        self.isConnected = False

    def send(self, message):
        self.ws.send(message)

    def _handleCallFunction(data: dict):
        pass
