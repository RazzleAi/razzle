package razzle.ai.api.widget;

import java.util.List;

/**
 * created by Julian Duru on 26/02/2023
 */
public interface IActionTrigger {

    String getAction();

    String getLabel();

    List<Object> getArgs();

    Type getType();


    enum Type {

        RazzleAction,

        URL

    }


}

