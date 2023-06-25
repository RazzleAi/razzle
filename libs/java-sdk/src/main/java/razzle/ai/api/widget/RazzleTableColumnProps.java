package razzle.ai.api.widget;


/**
 * created by Julian Duru on 26/02/2023
 */
public class RazzleTableColumnProps {


  private String id;


  private String header;


  private Number width;


  public static RazzleTableColumnProps with(String id, String header, Number width) {
    var props = new RazzleTableColumnProps();
    props.id = id;
    props.header = header;
    props.width = width;

    return props;
  }


  public static RazzleTableColumnProps with(String id, String header) {
    var props = new RazzleTableColumnProps();
    props.id = id;
    props.header = header;

    return props;
  }


  public static RazzleTableColumnProps with(String header) {
    var props = new RazzleTableColumnProps();
    props.header = header;

    return props;
  }


  public String getId() {
    return id;
  }


  public String getHeader() {
    return header;
  }


  public Number getWidth() {
    return width;
  }
}
