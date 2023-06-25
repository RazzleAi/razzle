package razzle.ai.ws;

import razzle.ai.api.ServerMessage;
import razzle.ai.api.ServerMessageType;
import razzle.ai.api.ServerRequest;
import razzle.ai.util.JSONUtil;

/**
 * created by julian on 09/02/2023
 */
interface TextMessageHandler {


    ServerRequest<?> handleTextMessage(String message) throws Exception;


    default boolean canHandleMessage(ServerMessage<?> message) {
        return canHandleMessageType(message.getEvent());
    }


    default boolean canHandleMessage(String message) {
        try {
            var messageObject = JSONUtil.fromJsonString(message, ServerMessage.class);
            return canHandleMessageType(messageObject.getEvent());
        }
        catch (Throwable e) {
            return false;
        }
    }


    boolean canHandleMessageType(ServerMessageType type);


}
