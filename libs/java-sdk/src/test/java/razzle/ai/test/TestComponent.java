package razzle.ai.test;

import org.springframework.stereotype.Component;
import razzle.ai.annotation.ActionParam;
import razzle.ai.annotation.Action;
import razzle.ai.api.CallDetails;
import razzle.ai.api.widget.*;
import static razzle.ai.api.widget.RazzleResponse.*;

import java.util.List;

/**
 * created by julian on 09/02/2023
 */
@Component
public class TestComponent {


    @Action(name = "testAction", description = "test a razzle action")
    public RazzleResponse testingActions(@ActionParam String name, CallDetails callDetails) {
        return text("Hello " + name);
    }


    @Action(name = "testAction2", description = "test a razzle action 2")
    public RazzleResponse testingActions2(@ActionParam String name, @ActionParam String email, CallDetails callDetails) {
        return text(
            "Hello " + name + " your email is " + email,
            WidgetPadding.DEFAULT
        );
    }


    @Action(name = "callLinkAction", description = "call a razzle link action")
    public RazzleResponse composeLink(@ActionParam String name) {
        return link(
            "Follow Link",
            "http://localhost:8080/testAction?name=" + name
        );
    }


    @Action(name = "callListAction", description = "call a razzle list action")
    public RazzleResponse composeList() {
        return RazzleResponse.of(
            new RazzleList(
                RazzleListProps.of(
                    "Call List Action",

                    RazzleListItemProps.builder()
                        .text("Item 1")
                        .onSelect(
                            RazzleActionTrigger.of(
                                IActionTrigger.Type.URL,
                                "http://localhost:8080/testAction?name=Item 1",
                                "Follow Link"
                            )
                        )
                        .build(),

                    RazzleListItemProps.builder()
                        .text("Item 2")
                        .onSelect(
                            RazzleActionTrigger.of(
                                IActionTrigger.Type.URL,
                                "http://localhost:8080/testAction?name=Item 2",
                                "Follow Link"
                            )
                        )
                        .build(),

                    RazzleListItemProps.builder()
                        .text("Item 3")
                        .onSelect(
                            RazzleActionTrigger.of(
                                IActionTrigger.Type.URL,
                                "http://localhost:8080/testAction?name=Item 3",
                                "Follow Link"
                            )
                        )
                        .build()
                )
            )
        );
    }


    @Action(name = "callTableAction", description = "call a razzle table action")
    public RazzleResponse composeTable() {
        return RazzleResponse.of(
            new RazzleTable(
                RazzleTableProps.builder()
                    .columns(
                        List.of(
                            RazzleTableColumnProps.builder()
                                .header("Column 1")
                                .build(),
                            RazzleTableColumnProps.builder()
                                .header("Column 2")
                                .build(),
                            RazzleTableColumnProps.builder()
                                .header("Column 3")
                                .build(),
                            RazzleTableColumnProps.builder()
                                .header("Column 4")
                                .build()
                        )
                    )
                    .data(
                        new String[][]{
                            {"Row1 - Sample", "Table", "Data", "Testing"},
                            {"Row2 - Sample", "Table", "Data", "Testing"},
                            {"Row3 - Sample", "Table", "Data", "Testing"},
                        }
                    )
                    .build()
            )
        );
    }


    @Action(
        name = "callCustomTableAction",
        description = "call a razzle custom table action"
    )
    public RazzleResponse composeCustomTable() {
        return RazzleResponse.of(
            new RazzleCustomTable(
                RazzleCustomTableProps.builder()
                    .title("Custom Table")
                    .columns(
                        List.of(
                            RazzleCustomTableColumnProps.builder()
                                .id("col1")
                                .header("Column 1")
                                .build(),
                            RazzleCustomTableColumnProps.builder()
                                .id("col2")
                                .header("Column 2")
                                .build(),
                            RazzleCustomTableColumnProps.builder()
                                .id("col3")
                                .header("Column 3")
                                .build(),
                            RazzleCustomTableColumnProps.builder()
                                .id("col4")
                                .header("Column 4")
                                .build()
                        )
                    )
                    .rows(
                        List.of(
                            RazzleCustomTableRowProps.builder()
                                .cells(
                                    List.of(
                                        RazzleCustomTableCellProps.builder()
                                            .id("col1")
                                            .widget(
                                                new RazzleText(
                                                    RazzleTextProps.builder()
                                                        .text("Col1 - Sample")
                                                        .build()
                                                )
                                            )
                                            .build(),
                                        RazzleCustomTableCellProps.builder()
                                            .id("col2")
                                            .widget(
                                                new RazzleText(
                                                    RazzleTextProps.builder()
                                                        .text("Col2 - Sample")
                                                        .build()
                                                )
                                            )
                                            .build(),
                                        RazzleCustomTableCellProps.builder()
                                            .id("col3")
                                            .widget(
                                                new RazzleText(
                                                    RazzleTextProps.builder()
                                                        .text("Col3 - Sample")
                                                        .build()
                                                )
                                            )
                                            .build(),
                                        RazzleCustomTableCellProps.builder()
                                            .id("col4")
                                            .widget(
                                                new RazzleText(
                                                    RazzleTextProps.builder()
                                                        .text("Col4 - Sample")
                                                        .build()
                                                )
                                            )
                                            .build()
                                    )
                                )
                                .build(),
                            RazzleCustomTableRowProps.builder()
                                .cells(
                                    List.of(
                                        RazzleCustomTableCellProps.builder()
                                            .id("col1")
                                            .widget(
                                                new RazzleText(
                                                    RazzleTextProps.builder()
                                                        .text("Col21 - Sample")
                                                        .build()
                                                )
                                            )
                                            .build(),
                                        RazzleCustomTableCellProps.builder()
                                            .id("col2")
                                            .widget(
                                                new RazzleText(
                                                    RazzleTextProps.builder()
                                                        .text("Col22 - Sample")
                                                        .build()
                                                )
                                            )
                                            .build(),
                                        RazzleCustomTableCellProps.builder()
                                            .id("col3")
                                            .widget(
                                                new RazzleText(
                                                    RazzleTextProps.builder()
                                                        .text("Col23 - Sample")
                                                        .build()
                                                )
                                            )
                                            .build(),
                                        RazzleCustomTableCellProps.builder()
                                            .id("col4")
                                            .widget(
                                                new RazzleText(
                                                    RazzleTextProps.builder()
                                                        .text("Col24 - Sample")
                                                        .build()
                                                )
                                            )
                                            .build()
                                    )
                                )
                                .build(),
                            RazzleCustomTableRowProps.builder()
                                .cells(
                                    List.of(
                                        RazzleCustomTableCellProps.builder()
                                            .id("col1")
                                            .widget(
                                                new RazzleText(
                                                    RazzleTextProps.builder()
                                                        .text("Col31 - Sample")
                                                        .build()
                                                )
                                            )
                                            .build(),
                                        RazzleCustomTableCellProps.builder()
                                            .id("col2")
                                            .widget(
                                                new RazzleText(
                                                    RazzleTextProps.builder()
                                                        .text("Col32 - Sample")
                                                        .build()
                                                )
                                            )
                                            .build(),
                                        RazzleCustomTableCellProps.builder()
                                            .id("col3")
                                            .widget(
                                                new RazzleText(
                                                    RazzleTextProps.builder()
                                                        .text("Col33 - Sample")
                                                        .build()
                                                )
                                            )
                                            .build(),
                                        RazzleCustomTableCellProps.builder()
                                            .id("col4")
                                            .widget(
                                                new RazzleLink(
                                                    RazzleLinkProps.builder()
                                                        .action(
                                                            RazzleActionTrigger.of(
                                                                IActionTrigger.Type.URL,
                                                                "https://www.google.com",
                                                                "Google"
                                                            )
                                                        )
                                                        .build()
                                                )
                                            )
                                            .build()
                                    )
                                )
                                .build()
                        )
                    )
                    .build()
            )
        );
    }


}


