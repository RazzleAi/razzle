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

          RazzleListItemProps.with(
            "Item 1",
            RazzleActionTrigger.of(
              IActionTrigger.Type.URL,
              "http://localhost:8080/testAction?name=Item 1",
              "Follow Link"
            )
          ),

          RazzleListItemProps.with(
            "Item 2",
            RazzleActionTrigger.of(
              IActionTrigger.Type.URL,
              "http://localhost:8080/testAction?name=Item 2",
              "Follow Link"
            )
          ),

          RazzleListItemProps.with(
            "Item 3",
            RazzleActionTrigger.of(
              IActionTrigger.Type.URL,
              "http://localhost:8080/testAction?name=Item 3",
              "Follow Link"
            )
          )
        )
      )
    );
  }


  @Action(name = "callTableAction", description = "call a razzle table action")
  public RazzleResponse composeTable() {
    return RazzleResponse.of(
      new RazzleTable(
        RazzleTableProps.with(
          List.of(
            RazzleTableColumnProps.with("Column 1"),
            RazzleTableColumnProps.with("Column 2"),
            RazzleTableColumnProps.with("Column 3"),
            RazzleTableColumnProps.with("Column 4")
          ),

          new String[][]{
            {"Row1 - Sample", "Table", "Data", "Testing"},
            {"Row2 - Sample", "Table", "Data", "Testing"},
            {"Row3 - Sample", "Table", "Data", "Testing"},
          }
        )
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
        RazzleCustomTableProps.with(
          "Custom Table",
          List.of(
            RazzleCustomTableColumnProps.with("col1", "Column 1"),
            RazzleCustomTableColumnProps.with("col2", "Column 2"),
            RazzleCustomTableColumnProps.with("col3", "Column 3"),
            RazzleCustomTableColumnProps.with("col4", "Column 4")
          ),

          List.of(
            RazzleCustomTableRowProps.with(
              List.of(
                RazzleCustomTableCellProps.with(
                  "col1",
                  new RazzleText(
                    RazzleTextProps.with("Col1 - Sample")
                  )
                ),
                RazzleCustomTableCellProps.with(
                  "col2",
                  new RazzleText(
                    RazzleTextProps.with("Col2 - Sample")
                  )
                ),
                RazzleCustomTableCellProps.with(
                  "col3",
                  new RazzleText(
                    RazzleTextProps.with("Col3 - Sample")
                  )
                ),
                RazzleCustomTableCellProps.with(
                  "col4",
                  new RazzleText(
                    RazzleTextProps.with("Col4 - Sample")
                  )
                )
              )
            ),
            RazzleCustomTableRowProps.with(
              List.of(
                RazzleCustomTableCellProps.with(
                  "col1",
                  new RazzleText(
                    RazzleTextProps.with("Col21 - Sample")
                  )
                ),
                RazzleCustomTableCellProps.with(
                  "col2",
                  new RazzleText(
                    RazzleTextProps.with("Col22 - Sample")
                  )
                ),
                RazzleCustomTableCellProps.with(
                  "col3",
                  new RazzleText(
                    RazzleTextProps.with("Col23 - Sample")
                  )
                ),
                RazzleCustomTableCellProps.with(
                  "col4",
                  new RazzleText(
                    RazzleTextProps.with("Col24 - Sample")
                  )
                )
              )
            ),
            RazzleCustomTableRowProps.with(
              List.of(
                RazzleCustomTableCellProps.with(
                  "col1",
                  new RazzleText(
                    RazzleTextProps.with("Col31 - Sample")
                  )
                ),
                RazzleCustomTableCellProps.with(
                  "col2",
                  new RazzleText(
                    RazzleTextProps.with("Col32 - Sample")
                  )
                ),
                RazzleCustomTableCellProps.with(
                  "col3",
                  new RazzleText(
                    RazzleTextProps.with("Col33 - Sample")
                  )
                ),
                RazzleCustomTableCellProps.with(
                  "col4",
                  new RazzleLink(
                    RazzleLinkProps.with(
                      RazzleActionTrigger.of(
                        IActionTrigger.Type.URL,
                        "https://www.google.com",
                        "Google"
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    );
  }


}


