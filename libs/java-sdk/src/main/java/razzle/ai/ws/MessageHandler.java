package razzle.ai.ws;

import razzle.ai.exception.ReceiverException;

import java.nio.ByteBuffer;

/**
 * created by julian on 09/02/2023
 */
public interface MessageHandler {


    void handleTextMessage(String message) throws ReceiverException;


    void handleByteMessage(ByteBuffer message) throws ReceiverException;


}
