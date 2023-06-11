package razzle.ai.api;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

/**
 * created by julian on 09/02/2023
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServerRequestData<T> {


    private Map<String, String> headers;


    private T payload;


    public ServerRequestData(T payload) {
        this.payload = payload;
    }


    public ServerRequestData<T> addHeader(String key, String value) {
        if (headers == null) {
            headers = new HashMap<>();
        }

        headers.put(key, value);
        return this;
    }


}

