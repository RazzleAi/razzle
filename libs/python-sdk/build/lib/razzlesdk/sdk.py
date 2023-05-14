import inspect
from decorators import *

class RazzleProps(object):

    def __init__(self, appId: str, apiKey: str, requiresAuth: bool, modules: list[object]) -> None:
        self.appId = appId
        self.apiKey = apiKey
        self.requiresAuth = requiresAuth
        self.modules = modules


class Razzle(object):

    def __init__(self, props: RazzleProps) -> None:
        self.props = props
        self.actionHandlers = list()
        self.initHandlers()
    
    def initHandlers(self):
        modules = self.props.modules
        for module in modules:
            for name, value in inspect.getmembers(module):
                pass
        pass


class RazzleServer(object):
    pass
