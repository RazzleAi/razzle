package razzle.ai.api.widget;

/**
 * created by Julian Duru on 26/02/2023
 */
public class RazzleLinkProps {


  private IActionTrigger action;


  private RazzleTextSize textSize;


  public IActionTrigger getAction() {
    return action;
  }

  public RazzleTextSize getTextSize() {
    return textSize;
  }

  public static RazzleLinkProps with(IActionTrigger action, RazzleTextSize textSize) {
    var props = new RazzleLinkProps();
    props.action = action;
    props.textSize = textSize;

    return props;
  }


  public static RazzleLinkProps with(IActionTrigger action) {
    var props = new RazzleLinkProps();
    props.action = action;

    return props;
  }


}
