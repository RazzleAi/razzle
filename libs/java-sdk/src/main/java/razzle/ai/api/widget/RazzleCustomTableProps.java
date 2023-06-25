package razzle.ai.api.widget;

import java.util.ArrayList;
import java.util.List;

/**
 * created by Julian Duru on 01/03/2023
 */
public class RazzleCustomTableProps {

  private String title;

  private List<RazzleCustomTableColumnProps> columns;

  private List<RazzleCustomTableRowProps> rows;


  public RazzleCustomTableProps(
    String title,
    List<RazzleCustomTableColumnProps> columns,
    List<RazzleCustomTableRowProps> rows) {
    this.title = title;
    this.columns = columns;
    this.rows = rows;
  }


  public RazzleCustomTableProps(
    String title
  ) {
    this.title = title;
    this.columns = new ArrayList<>();
    this.rows = new ArrayList<>();
  }


  public String getTitle() {
    return title;
  }

  public List<RazzleCustomTableColumnProps> getColumns() {
    return columns;
  }

  public List<RazzleCustomTableRowProps> getRows() {
    return rows;
  }

  public static RazzleCustomTableProps with(
    String title, List<RazzleCustomTableColumnProps> columns, List<RazzleCustomTableRowProps> rows
  ) {
    return new RazzleCustomTableProps(title, columns, rows);
  }

}

