package razzle.ai.context;

import java.util.List;
import java.util.Map;

/**
 * created by julian on 19/02/2023
 */

public class ActionParamTypeMapping {


    private static final Map<String, List<String>> typeMappings = Map.of(
        "string", List.of("java.lang.String"),
        "number", List.of("java.lang.Integer", "java.lang.Long", "java.lang.Float", "java.lang.Double"),
        "boolean", List.of("java.lang.Boolean"),
        "date", List.of("java.time.LocalDate"),
        "datetime", List.of("java.time.LocalDateTime")
    );


    public static List<String> getSupportedParamTypes() {
        return typeMappings.keySet().stream()
            .map(typeMappings::get)
            .flatMap(List::stream)
            .toList();
    }


    public static boolean isSupportedParamType(String type) {
        return getSupportedParamTypes().contains(type);
    }


    public static String getKeyForParamType(String type) {
        return typeMappings.keySet().stream()
            .filter(key -> typeMappings.get(key).contains(type))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Unsupported param type: " + type));
    }


}

