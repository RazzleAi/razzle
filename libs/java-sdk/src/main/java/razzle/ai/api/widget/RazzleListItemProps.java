package razzle.ai.api.widget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * created by Julian Duru on 26/02/2023
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RazzleListItemProps {

    private String text;

    private IActionTrigger onSelect;

    private List<IActionTrigger> actions = new ArrayList<>();


}

