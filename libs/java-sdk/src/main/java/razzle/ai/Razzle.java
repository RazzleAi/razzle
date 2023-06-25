package razzle.ai;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import razzle.ai.config.RazzleConfig;
import razzle.ai.api.ServerRequest;
import razzle.ai.api.ServerRequestType;
import razzle.ai.api.SyncAppPayload;
import razzle.ai.context.RazzleActionHandlersContainer;
import razzle.ai.ws.MessageHandler;
import razzle.ai.ws.WebSocketContainer;


/**
 * created by julian on 09/02/2023
 */
@Component
public class Razzle {

  @Autowired(required = false)
  private AuthenticationFunction authenticationFunction;

  private final RazzleConfig razzleConfig;

  private final MessageHandler messageHandler;

  private final RazzleActionHandlersContainer actionHandlersContainer;

  private static WebSocketContainer clientContainer;


  public Razzle(
    RazzleConfig razzleConfig,
    MessageHandler messageHandler,
    RazzleActionHandlersContainer actionHandlersContainer
  ) {
    this.razzleConfig = razzleConfig;
    this.messageHandler = messageHandler;
    this.actionHandlersContainer = actionHandlersContainer;
  }


  @PostConstruct
  public void init() {
    validateConfiguration();

    clientContainer = new WebSocketContainer(razzleConfig, messageHandler);
    clientContainer.start();

    registerActions();
  }


  private void validateConfiguration() throws IllegalStateException {
    if (razzleConfig.isRequiresAuth() && authenticationFunction == null) {
      throw new IllegalStateException("Authentication function is required");
    }
  }


  private void registerActions() {
    var actionHandlers = actionHandlersContainer.getHandlers();

    clientContainer.send(
      new ServerRequest<>(
        ServerRequestType.SyncApp,
        new SyncAppPayload.Builder()
          .sdkVersion(RazzleConstants.SDK_VERSION)
          .requiresAuth(razzleConfig.isRequiresAuth())
          .actions(actionHandlers)
          .build()
      )
    );
  }


  public static WebSocketContainer client() {
    return clientContainer;
  }


}

