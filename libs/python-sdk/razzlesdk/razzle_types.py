
class RazzlePagination(object):

    def __init__(self, pageNumber: int, pageSize: int, totalCount: int, frameId: str = None):
        self.frameId = frameId
        self.pageNumber = pageNumber
        self.pageSize = pageSize
        self.totalCount = totalCount


class RazzleError(object):

    def __init__(self, message: str):
        self.message = message


class ActionArgs(object):

    def __init__(self, name: str, value: str, type: str):
        self.name = name
        self.value = value
        self.type = type


class ActionAndArgs(object):

    def __init__(self, actionName: str, actionDescription: str, actionArgs: list[ActionArgs]):
        self.actionName = actionName
        self.actionDescription = actionDescription
        self.actionArgs = actionArgs


class RazzleResponse(object):

    def __init__(self, ui=None, data=None, error=None, pagination: RazzlePagination = None):
        self.ui = ui
        self.data = data
        self.error = error
        self.pagination = pagination


class RazzleResponseWithActionArgs(RazzleResponse):

    def __init__(self, ui=None, data=None, error=None, pagination: RazzlePagination = None, actionAndArgs: ActionAndArgs = None):
        super().__init__(ui, data, error, pagination)
        self.actionAndArgs = actionAndArgs
