package razzle.ai.api.widget;


import java.util.List;

/**
 * created by Julian Duru on 01/03/2023
 */
public class RazzleCustomTableCell extends RazzleWidget implements IRazzleCustomTableCell {

  private String id;

  private RazzleWidget widget;


  public RazzleCustomTableCell(RazzleCustomTableCellProps props) {
    this.id = props.getId();
    this.widget = props.getWidget();
  }


  @Override
  public String getType() {
    return RazzleWidgetType.CUSTOM_TABLE_CELL.getValue();
  }


  @Override
  public IRazzleCustomTableCell toJSON() {
    return this;
  }


  @Override
  protected void validate() throws IllegalStateException {

  }


  @Override
  public String getId() {
    return id;
  }

  @Override
  public IRazzleWidget getWidget() {
    return widget;
  }


}

