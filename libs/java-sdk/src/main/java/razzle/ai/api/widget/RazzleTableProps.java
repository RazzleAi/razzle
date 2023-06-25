package razzle.ai.api.widget;

import java.util.List;

/**
 * created by Julian Duru on 26/02/2023
 */
public class RazzleTableProps {

  private List<RazzleTableColumnProps> columns;

  private String[][] data;

  private boolean showPagination;


  public List<RazzleTableColumnProps> getColumns() {
    return columns;
  }

  public String[][] getData() {
    return data;
  }

  public boolean isShowPagination() {
    return showPagination;
  }


  public static RazzleTableProps with(List<RazzleTableColumnProps> columns, String[][] data) {
    var props = new RazzleTableProps();
    props.columns = columns;
    props.data = data;

    return props;
  }


}
