package razzle.ai.api.widget;

/**
 * created by Julian Duru on 01/03/2023
 */
public class RazzleCustomTableColumn extends RazzleWidget implements IRazzleCustomTableColumn {

  private String id;

  private String header;

  private Number width;


  public RazzleCustomTableColumn(RazzleCustomTableColumnProps props) {
    this.id = props.getId();
    this.header = props.getHeader();
    this.width = props.getWidth();
  }


  @Override
  public String getType() {
    return RazzleWidgetType.CUSTOM_TABLE_COLUMN.getValue();
  }


  @Override
  public IRazzleCustomTableColumn toJSON() {
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
  public String getHeader() {
    return header;
  }

  @Override
  public Number getWidth() {
    return width;
  }
}

