package razzle.ai.api.widget;

import java.util.ArrayList;
import java.util.List;

/**
 * created by Julian Duru on 26/02/2023
 */
public class RazzleListItemProps {

  private String text;

  private IActionTrigger onSelect;

  private List<IActionTrigger> actions = new ArrayList<>();


  public String getText() {
    return text;
  }

  public IActionTrigger getOnSelect() {
    return onSelect;
  }

  public List<IActionTrigger> getActions() {
    return actions;
  }


  public static RazzleListItemProps with(
    String text, IActionTrigger onSelect
  ) {
    var props = new RazzleListItemProps();
    props.text = text;
    props.onSelect = onSelect;

    return props;
  }


}

