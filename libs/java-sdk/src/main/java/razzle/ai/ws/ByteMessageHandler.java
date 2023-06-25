package razzle.ai.ws;

import razzle.ai.api.ServerRequest;

import java.nio.ByteBuffer;

/**
 * created by julian on 09/02/2023
 */
interface ByteMessageHandler {


    ServerRequest<?> handleByteMessage(ByteBuffer message);


}
