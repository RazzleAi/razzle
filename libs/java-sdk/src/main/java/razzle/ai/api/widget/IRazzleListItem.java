package razzle.ai.api.widget;

import java.util.List;

/**
 * created by Julian Duru on 26/02/2023
 */
public interface IRazzleListItem extends IRazzleWidget {

    String getText();

    IActionTrigger getOnSelect();

    List<IActionTrigger> getActions();

}

