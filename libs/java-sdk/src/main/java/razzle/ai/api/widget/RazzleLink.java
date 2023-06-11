package razzle.ai.api.widget;

import lombok.Getter;
import org.springframework.util.StringUtils;

/**
 * created by Julian Duru on 26/02/2023
 */
@Getter
public class RazzleLink extends RazzleWidget implements IRazzleLink {

    private final IActionTrigger action;

    private final RazzleTextSize textSize;


    public RazzleLink(RazzleLinkProps props) {
        this.action = props.getAction();
        this.textSize = props.getTextSize() != null ? props.getTextSize() : RazzleTextSize.medium;
    }


    @Override
    public String getType() {
        return RazzleWidgetType.LINK.getValue();
    }


    @Override
    public IRazzleLink toJSON() {
        return this;
    }


    @Override
    protected void validate() throws IllegalStateException {
        if (!(action.getType() != null && StringUtils.hasText(action.getLabel()) &&
            StringUtils.hasText(action.getAction()))) {
            throw new IllegalStateException("RazzleLink should have a valid label, action and type");
        }
    }


}
