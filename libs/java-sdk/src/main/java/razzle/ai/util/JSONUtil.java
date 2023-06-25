package razzle.ai.util;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.json.JSONObject;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * created by julian
 */
public class JSONUtil {

    static ObjectMapper objectMapper;


    static {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }


    public static String asJsonString(Object obj) throws JsonProcessingException {
        return objectMapper.writeValueAsString(obj);
    }


    public static String asJsonString(Object obj, String defaultString) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return defaultString;
        }
    }


    public static <T> T fromJsonString(String json, Class<T> klass) throws IOException {
        return objectMapper.readValue(json, klass);
    }


    public static Map<String, String> readJSONMap(String jsonSource) {
        if (!StringUtils.hasText(jsonSource)) {
            return Map.of();
        }

        var map = new JSONObject(jsonSource).toMap();
        return map.entrySet().stream()
            .map(e -> Map.entry(e.getKey(), e.getValue().toString()))
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }


    public static <T> T asObjectOfClass(Object object, Class<T> klass) throws IOException {
        var jsonString = JSONUtil.asJsonString(object);
        return JSONUtil.fromJsonString(jsonString, klass);
    }


}
