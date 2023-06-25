package razzle.ai.api.widget;

import java.util.List;
import java.util.Map;

/**
 * created by Julian Duru on 25/02/2023
 */
public class RazzleResponse {

  private String clientId;

  private RazzleWidget ui;

  private Map<String, String> addToContext;

  private String[] removeKeysFromContext;

  private Map<String, String> extraData;


  public static RazzleResponse of(RazzleWidget ui) {
    ui.validate();

    var response = new RazzleResponse();
    response.ui = ui;

    return response;
  }


  public static RazzleResponse text(String text) {
    return of(
      new RazzleText(RazzleTextProps.with(text))
    );
  }


  public static RazzleResponse text(String text, WidgetPadding padding) {
    return of(
      new RazzleText(RazzleTextProps.with(text, padding))
    );
  }


  public static RazzleResponse link(String label, String url) {
    return RazzleResponse.of(
      new RazzleLink(
        RazzleLinkProps.with(
          RazzleActionTrigger.of(
            IActionTrigger.Type.URL,
            url,
            label
          ),
          RazzleTextSize.medium
        )
      )
    );
  }


  public static RazzleResponse table(List<String> columns, String[][] data) {
    return of(
      new RazzleTable(
        RazzleTableProps.with(
          columns.stream().map(c -> RazzleTableColumnProps.with(c, c)).toList(),
          data
        )
      )
    );
  }


}


