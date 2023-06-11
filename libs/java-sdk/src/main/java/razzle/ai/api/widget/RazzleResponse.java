package razzle.ai.api.widget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * created by Julian Duru on 25/02/2023
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RazzleResponse {


    private String clientId;

    private RazzleWidget ui;

    private Map<String, String> addToContext;

    private String[] removeKeysFromContext;

    private Map<String, String> extraData;


    public static RazzleResponse of(RazzleWidget ui) {
        ui.validate();
        return RazzleResponse.builder()
            .ui(ui)
            .build();
    }


    public static RazzleResponse text(String text) {
        return of(
            new RazzleText(RazzleTextProps.builder()
                .text(text)
                .build()
            )
        );
    }


    public static RazzleResponse text(String text, WidgetPadding padding) {
        return of(
            new RazzleText(RazzleTextProps.builder()
                .text(text)
                .padding(padding)
                .build()
            )
        );
    }


    public static RazzleResponse link(String label, String url) {
        return RazzleResponse.of(
            new RazzleLink(
                RazzleLinkProps.builder()
                    .action(
                        RazzleActionTrigger.of(
                            IActionTrigger.Type.URL,
                            url,
                            label
                        )
                    )
                    .textSize(RazzleTextSize.medium)
                    .build()
            )
        );
    }


    public static RazzleResponse table(List<String> columns, String[][] data) {
        return of(
            new RazzleTable(
                RazzleTableProps.builder()
                    .columns(columns.stream().map(c -> RazzleTableColumnProps.with(c, c)).toList())
                    .data(data)
                    .build()
            )
        );
    }





}


