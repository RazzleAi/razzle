package razzle.ai.api.widget;

/**
 * created by Julian Duru on 01/03/2023
 */
public class RazzleCustomTableCellProps {

  private String id;

  private RazzleWidget widget;


  public static RazzleCustomTableCellProps with(String id, RazzleWidget widget) {
    var props = new RazzleCustomTableCellProps();
    props.id = id;
    props.widget = widget;

    return props;
  }

  public String getId() {
    return id;
  }


  public RazzleWidget getWidget() {
    return widget;
  }


}

