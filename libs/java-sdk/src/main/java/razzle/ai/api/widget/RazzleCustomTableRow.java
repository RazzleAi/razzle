package razzle.ai.api.widget;

import lombok.Data;

import java.util.List;

/**
 * created by Julian Duru on 01/03/2023
 */
@Data
public class RazzleCustomTableRow extends RazzleWidget implements IRazzleCustomTableRow<RazzleCustomTableCell> {


    private List<RazzleCustomTableCell> cells;


    public RazzleCustomTableRow(RazzleCustomTableRowProps props) {
        this.cells = props.getCells().stream().map(RazzleCustomTableCell::new).toList();
    }


    @Override
    public String getType() {
        return RazzleWidgetType.CUSTOM_TABLE_ROW.getValue();
    }


    @Override
    public RazzleCustomTableRow toJSON() {
        return this;
    }


    @Override
    protected void validate() throws IllegalStateException {

    }


}

