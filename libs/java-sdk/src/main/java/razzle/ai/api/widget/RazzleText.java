package razzle.ai.api.widget;

import lombok.Getter;
import org.springframework.util.StringUtils;

/**
 * created by Julian Duru on 25/02/2023
 */
@Getter
public class RazzleText extends RazzleWidget implements IRazzleText {

    private final String text;

    private final WidgetPadding padding;

    private final RazzleTextSize textSize;

    private final String textColor;

    private final RazzleTextWeight textWeight;


    public RazzleText(RazzleTextProps props) {
        this.text = props.getText();
        this.padding = props.getPadding() != null ? props.getPadding() : WidgetPadding.DEFAULT;
        this.textSize = props.getTextSize() != null ? props.getTextSize() : RazzleTextSize.medium;
        this.textColor = props.getTextColor();
        this.textWeight = props.getTextWeight() != null ? props.getTextWeight() : RazzleTextWeight.normal;
    }


    @Override
    public String getType() {
        return RazzleWidgetType.TEXT.getValue();
    }


    @Override
    public IRazzleText toJSON() {
        return this;
    }


    @Override
    protected void validate()  throws IllegalStateException {
        if (!StringUtils.hasText(text)) {
            throw new IllegalStateException("RazzleText should have a valid text");
        }
    }


}
