package razzle.ai.api;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

/**
 * created by julian on 09/02/2023
 */
@Data
public class ServerMessageData<T> {


//    private String appId;


    private Map<String, Object> headers;


    private T payload;


    public ServerMessageData<T> addHeader(String key, String value) {
        if (headers == null) {
            headers = new HashMap<>();
        }

        headers.put(key, value);
        return this;
    }


}

