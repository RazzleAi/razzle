package razzle.ai.api.widget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * created by Julian Duru on 26/02/2023
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RazzleListProps {


    private String title;


    private List<RazzleListItemProps> items;


    public RazzleListProps items(RazzleListItemProps... items) {
        this.items = List.of(items);
        return this;
    }


    public static RazzleListProps of(String title, RazzleListItemProps... items) {
        return RazzleListProps.builder()
            .title(title)
            .items(List.of(items))
            .build();
    }


}

