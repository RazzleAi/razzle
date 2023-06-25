package razzle.ai.api.widget;

import java.util.ArrayList;
import java.util.List;

/**
 * created by Julian Duru on 27/02/2023
 */
public class RazzleActionTrigger implements IActionTrigger {

  private Type type;

  private String action;

  private String label;

  private List<Object> args;

  public RazzleActionTrigger(Type type, String action, String label, List<Object> args) {
    this.type = type;
    this.action = action;
    this.label = label;
    this.args = args;
  }


  public static RazzleActionTrigger of(Type type, String action, String label) {
    return new RazzleActionTrigger(type, action, label, new ArrayList<>());
  }

  @Override
  public Type getType() {
    return type;
  }

  @Override
  public String getAction() {
    return action;
  }

  @Override
  public String getLabel() {
    return label;
  }

  @Override
  public List<Object> getArgs() {
    return args;
  }
}


