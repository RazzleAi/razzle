package razzle.ai.api.widget;

import lombok.Getter;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * created by Julian Duru on 26/02/2023
 */
@Getter
public class RazzleListItem extends RazzleWidget implements IRazzleListItem {

    private final String text;

    private final IActionTrigger onSelect;

    private final List<IActionTrigger> actions;


    public RazzleListItem(RazzleListItemProps props) {
        this.text = props.getText();
        this.onSelect = props.getOnSelect();
        this.actions = props.getActions();
    }


    @Override
    public String getType() {
        return RazzleWidgetType.LIST_ITEM.getValue();
    }


    @Override
    public IRazzleListItem toJSON() {
        return this;
    }


    @Override
    protected void validate()  throws IllegalStateException {
        if (!StringUtils.hasText(text)) {
            throw new IllegalStateException("RazzleListItem should have a valid text");
        }
    }


}


