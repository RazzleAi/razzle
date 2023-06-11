package razzle.ai.api.widget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * created by Julian Duru on 01/03/2023
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RazzleCustomTableCellProps {


    private String id;

    private RazzleWidget widget;


}
