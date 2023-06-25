package razzle.ai.api.widget;

import java.util.List;

/**
 * created by Julian Duru on 01/03/2023
 */
public class RazzleCustomTableRowProps {


  private List<RazzleCustomTableCellProps> cells;


  public List<RazzleCustomTableCellProps> getCells() {
    return cells;
  }


  public static RazzleCustomTableRowProps with(List<RazzleCustomTableCellProps> cells) {
    var props = new RazzleCustomTableRowProps();
    props.cells = cells;

    return props;
  }


}
