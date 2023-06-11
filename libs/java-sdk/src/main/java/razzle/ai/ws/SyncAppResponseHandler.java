package razzle.ai.ws;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import razzle.ai.api.ServerMessageType;
import razzle.ai.api.ServerRequest;

/**
 * created by julian on 09/02/2023
 */
@Slf4j
@Component
public class SyncAppResponseHandler implements TextMessageHandler {


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
