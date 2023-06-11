package razzle.ai.api.widget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * created by Julian Duru on 26/02/2023
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RazzleLinkProps {


    private IActionTrigger action;


    private RazzleTextSize textSize;


}
