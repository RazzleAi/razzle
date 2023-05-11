from razzlesdk import Razzle, RazzleProps, Action, ActionParam

class HelloApp(object):

    def handlePrompt(prompt: str):
        pass


if __name__ == "__main__":
    app = HelloApp()
    appId = ""
    apiKey = ""
    
    razzleApp = Razzle(RazzleProps(appId, apiKey, False, [], app.handlePrompt))