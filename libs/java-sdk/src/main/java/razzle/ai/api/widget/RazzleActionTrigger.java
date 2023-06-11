package razzle.ai.api.widget;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * created by Julian Duru on 27/02/2023
 */
@Data
@AllArgsConstructor
public class RazzleActionTrigger implements IActionTrigger {

    private Type type;

    private String action;

    private String label;

    private List<Object> args;


    public static RazzleActionTrigger of(Type type, String action, String label) {
        return new RazzleActionTrigger(type, action, label, new ArrayList<>());
    }


}
