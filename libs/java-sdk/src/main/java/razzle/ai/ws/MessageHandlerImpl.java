package razzle.ai.ws;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import razzle.ai.Razzle;
import razzle.ai.api.ServerMessage;
import razzle.ai.exception.ReceiverException;
import razzle.ai.util.JSONUtil;

import java.nio.ByteBuffer;
import java.util.List;

/**
 * created by julian on 09/02/2023
 */
@Component
@RequiredArgsConstructor
public class MessageHandlerImpl implements MessageHandler {


    private final List<TextMessageHandler> textMessageHandlers;



    @Override
    public void handleTextMessage(String message) throws ReceiverException {
        try {
            TextMessageHandler selectedHandler = null;
            var messageObject = JSONUtil.fromJsonString(message, ServerMessage.class);

            for (TextMessageHandler handler : textMessageHandlers) {
                if (handler.canHandleMessage(messageObject)) {
                    selectedHandler = handler;
                    break;
                }
            }

            if (selectedHandler == null) {
                throw new IllegalArgumentException("No handler found for message: " + message);
            }

            var serverRequest = selectedHandler.handleTextMessage(message);
            if (serverRequest != null) {
                Razzle.client().send(serverRequest);
            }
        }
        catch (Throwable e) {
            throw new ReceiverException("Error while handling message: " + message, e);
        }
    }


    @Override
    public void handleByteMessage(ByteBuffer message) throws ReceiverException {
        throw new UnsupportedOperationException("Byte messages are not supported yet");
    }


}

