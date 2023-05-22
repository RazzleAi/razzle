from razzlesdk import Razzle, RazzleProps, Action, ActionParam
import os

class HelloApp(object):

    def handlePrompt(prompt: str):
        pass


if __name__ == "__main__":
    app = HelloApp()
    appId = "38923f681c6acf00e79bdba06631eaf9"
    apiKey = "e331473e3f804b0a3a2a573422eb5b4cc36a8effd94a31e8fcff8b17b540eddf"
    
    razzleApp = Razzle(RazzleProps(appId, apiKey, False, [], app.handlePrompt))

    while True:
        inp = input("Press q to quit: ")
        if inp == "q":
            break

    os._exit(0)