package razzle.ai.ws;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Component;
import razzle.ai.api.ServerMessageType;
import razzle.ai.api.ServerRequest;

/**
 * created by julian on 09/02/2023
 */
@Component
public class SyncAppResponseHandler implements TextMessageHandler {

  private Logger log = LogManager.getLogger(SyncAppResponseHandler.class);


  @Override
  public ServerRequest<?> handleTextMessage(String message) throws Exception {
    log.info("Sync App Response: {}", message);
    return null;
  }


  @Override
  public boolean canHandleMessageType(ServerMessageType type) {
    return ServerMessageType.SyncAppResponse == type;
  }


}
