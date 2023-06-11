package razzle.ai.api.widget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * created by Julian Duru on 25/02/2023
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RazzleTextProps {


    private String text;


    private WidgetPadding padding = WidgetPadding.DEFAULT;


    private RazzleTextSize textSize;


    private String textColor;


    private RazzleTextWeight textWeight;


}

