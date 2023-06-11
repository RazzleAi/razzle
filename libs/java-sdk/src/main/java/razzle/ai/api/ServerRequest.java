package razzle.ai.api;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * created by julian on 09/02/2023
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServerRequest<T> {


    private ServerRequestType event;


    private ServerRequestData<T> data;


    public ServerRequest(ServerRequestType event) {
        this.event = event;
    }

    public ServerRequest(ServerRequestType event, T payload) {
        this.event = event;
        this.data = new ServerRequestData<>(payload);
    }

    public ServerRequest<T> addHeader(String key, String value) {
        if (data == null) {
            data = new ServerRequestData<>();
        }

        data.addHeader(key, value);
        return this;
    }


    public ServerRequest<T> addHeaders(Map<String, String> headers) {
        if (data == null) {
            data = new ServerRequestData<>();
        }

        for (Map.Entry<String, String> entry : headers.entrySet()) {
            data.addHeader(entry.getKey(), entry.getValue());
        }
        return this;
    }


    public ServerRequest<T> addObjectHeaders(Map<String, Object> headers) {
        if (data == null) {
            data = new ServerRequestData<>();
        }

        for (Map.Entry<String, Object> entry : headers.entrySet()) {
            data.addHeader(entry.getKey(), entry.getValue().toString());
        }

        return this;
    }


    public ServerRequest<T> setPayload(T payload) {
        if (data == null) {
            data = new ServerRequestData<>();
        }

        data.setPayload(payload);
        return this;
    }


    @Override
    public String toString() {
        return "ServerRequest{" +
            "event=" + event +
            ", data=" + data +
            '}';
    }


}

