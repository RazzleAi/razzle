import functools
import inspect


class HandlerMethodParam(object):
    def __init__(self, index: int, type: str, name: str):
        self.index = index
        self.type = type
        self.name = name


class Handler(object):

    def __init__(self, instance: object, method: callable, paramLen: int, params: list(HandlerMethodParam)):
        self.instance = instance
        self.method = method
        self.paramLen = paramLen
        self.params = params


HANDLERS: dict[str, Handler] = dict()


def Action(name: str, description: str, stealth: bool = False, paged: bool = False):
    def decorator_action(self, func):
        @functools.wraps(func)
        def inner(self, *args, **kwargs):
            return func(self, *args, **kwargs)
        rawParams = inspect.signature(inner).parameters
        paramLen = len(rawParams)
        rawParams = list(rawParams.values())
        params: list[HandlerMethodParam] = list()
        for i in range(paramLen):
            param = rawParams[i]
            name = param.name
            type = param.annotation
            hParam = HandlerMethodParam(i, type, name)
            params.append(hParam)
        
        HANDLERS[name] = Handler(self, inner, paramLen, params)
        return inner
    return decorator_action


# def FuncAction(name: str, description: str, stealth: bool = False, paged: bool = False):
#     def decorator_action(func):
#         @functools.wraps(func)
#         def inner(*args, **kwargs):
#             return func(*args, **kwargs)
#         HANDLERS[name] = inner
#         return inner
#     return decorator_action


def ActionParam(name: str):
    pass
