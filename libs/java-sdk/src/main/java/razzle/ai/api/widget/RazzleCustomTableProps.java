package razzle.ai.api.widget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * created by Julian Duru on 01/03/2023
 */
@Data
@Builder
@NoArgsConstructor
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


}

