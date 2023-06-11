package razzle.ai.api.widget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * created by Julian Duru on 25/02/2023
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WidgetPadding implements IWidgetPadding {


    private Number top;

    private Number bottom;

    private Number left;

    private Number right;


    public static WidgetPadding DEFAULT = WidgetPadding.builder()
        .top(10)
        .bottom(10)
        .left(10)
        .right(10)
        .build();


}

