package razzle.ai.context;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import razzle.ai.ActionHandler;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * created by julian on 09/02/2023
 */
@Slf4j
@Component
public class RazzleActionHandlersContainer {


    private final Map<String, ActionHandler> handlers = new HashMap<>();


    public void registerHandler(String name, ActionHandler handler) {
        if (handlers.containsKey(name)) {
            throw new IllegalStateException("Duplicate Action Name: " + name);
        }

        log.debug("Registering handler: {}", name);
        handlers.put(name, handler);
    }


    public List<ActionHandler> getHandlers() {
        return handlers.values().stream().toList();
    }


    public Optional<ActionHandler> getHandler(String name) {
        return Optional.ofNullable(handlers.get(name));
    }





}


