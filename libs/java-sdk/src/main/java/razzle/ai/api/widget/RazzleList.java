package razzle.ai.api.widget;

import lombok.Getter;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * created by Julian Duru on 26/02/2023
 */
@Getter
public class RazzleList extends RazzleWidget implements IRazzleList<RazzleListItem> {


    private final String title;


    private final List<RazzleListItem> items;


    public RazzleList(RazzleListProps props) {
        this.title = props.getTitle();
        this.items = props.getItems().stream()
            .map(RazzleListItem::new)
            .toList();
    }


    @Override
    public String getType() {
        return RazzleWidgetType.LIST.getValue();
    }


    @Override
    public RazzleList toJSON() {
        return this;
    }


    @Override
    protected void validate() throws IllegalStateException {
        if (!StringUtils.hasText(title)) {
            throw new IllegalStateException("RazzleList should have a valid title");
        }
    }


}

