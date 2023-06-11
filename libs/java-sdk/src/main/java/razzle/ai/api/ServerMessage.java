package razzle.ai.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.Data;
import razzle.ai.util.JSONUtil;

import java.io.IOException;

/**
 * created by julian on 09/02/2023
 */
@Data
public class ServerMessage<T> {


    private ServerMessageType event;


    private ServerMessageData<T> data;


}
