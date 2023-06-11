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
public class RazzleTableColumnProps {


    private String id;


    private String header;


    private Number width;


    public static RazzleTableColumnProps with(String id, String header, Number width) {
        return RazzleTableColumnProps.builder()
            .id(id)
            .header(header)
            .width(width)
            .build();
    }


    public static RazzleTableColumnProps with(String id, String header) {
        return RazzleTableColumnProps.builder()
            .id(id)
            .header(header)
            .build();
    }


}
