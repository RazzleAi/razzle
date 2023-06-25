package razzle.ai.context;

import org.springframework.stereotype.Component;
import razzle.ai.ActionHandler;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

/**
 * created by julian on 09/02/2023
 */
@Component
public class RazzleActionHandlersContainer {

    private Logger log = Logger.getLogger(RazzleActionHandlersContainer.class.getName());


    private final Map<String, ActionHandler> handlers = new HashMap<>();


    public void registerHandler(String name, ActionHandler handler) {
        if (handlers.containsKey(name)) {
            throw new IllegalStateException("Duplicate Action Name: " + name);
        }

        log.info("Registering handler: " + name);
        handlers.put(name, handler);
    }


    public List<ActionHandler> getHandlers() {
        return handlers.values().stream().toList();
    }


    public Optional<ActionHandler> getHandler(String name) {
        return Optional.ofNullable(handlers.get(name));
    }





}


