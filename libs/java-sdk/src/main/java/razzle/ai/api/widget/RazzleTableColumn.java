package razzle.ai.api.widget;

import lombok.Getter;
import org.springframework.util.StringUtils;

/**
 * created by Julian Duru on 26/02/2023
 */
@Getter
public class RazzleTableColumn extends RazzleWidget implements IRazzleTableColumn {

    private final String id;

    private final String header;

    private final Number width;


    public RazzleTableColumn(RazzleTableColumnProps props) {
        this.id = props.getId();
        this.header = props.getHeader();
        this.width = props.getWidth();
    }


    @Override
    public String getType() {
        return RazzleWidgetType.TABLE_COLUMN.getValue();
    }


    @Override
    public IRazzleTableColumn toJSON() {
        return this;
    }

    @Override
    protected void validate() throws IllegalStateException{
        if (!StringUtils.hasText(header)) {
            throw new IllegalStateException("RazzleTableColumn should have a valid header");
        }
    }


}


