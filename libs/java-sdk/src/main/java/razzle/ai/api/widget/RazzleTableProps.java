package razzle.ai.api.widget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * created by Julian Duru on 26/02/2023
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RazzleTableProps {


    private List<RazzleTableColumnProps> columns;

    private String[][] data;

    private boolean showPagination;


}
