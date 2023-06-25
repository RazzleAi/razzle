package razzle.ai.api.widget;

import java.util.List;

/**
 * created by Julian Duru on 01/03/2023
 */
public class RazzleCustomTable extends RazzleWidget implements IRazzleCustomTable<RazzleCustomTableColumn, RazzleCustomTableRow> {

  private String title;

  private List<RazzleCustomTableColumn> columns;

  private List<RazzleCustomTableRow> rows;


  public RazzleCustomTable(RazzleCustomTableProps props) {
    this.title = props.getTitle();
    this.columns = props.getColumns().stream().map(RazzleCustomTableColumn::new).toList();
    this.rows = props.getRows().stream().map(RazzleCustomTableRow::new).toList();
  }

  @Override
  public String getType() {
    return RazzleWidgetType.CUSTOM_TABLE.getValue();
  }


  @Override
  public RazzleCustomTable toJSON() {
    return this;
  }


  @Override
  protected void validate() throws IllegalStateException {

  }


  @Override
  public String getTitle() {
    return title;
  }

  @Override
  public List<RazzleCustomTableColumn> getColumns() {
    return columns;
  }

  @Override
  public List<RazzleCustomTableRow> getRows() {
    return rows;
  }


}
