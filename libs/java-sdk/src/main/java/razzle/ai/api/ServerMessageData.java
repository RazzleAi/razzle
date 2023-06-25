package razzle.ai.api;

import java.util.HashMap;
import java.util.Map;

/**
 * created by julian on 09/02/2023
 */
public class ServerMessageData<T> {


  private Map<String, Object> headers;


  private T payload;


  public ServerMessageData<T> addHeader(String key, String value) {
    if (headers == null) {
      headers = new HashMap<>();
    }

    headers.put(key, value);
    return this;
  }


  public Map<String, Object> getHeaders() {
    return headers;
  }

  public T getPayload() {
    return payload;
  }


}

