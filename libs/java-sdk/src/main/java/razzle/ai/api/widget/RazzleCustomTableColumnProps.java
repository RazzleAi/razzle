package razzle.ai.api.widget;

/**
 * created by Julian Duru on 01/03/2023
 */
public class RazzleCustomTableColumnProps {

  private String id;

  private String header;

  private Number width;

  public RazzleCustomTableColumnProps() {
  }

  public RazzleCustomTableColumnProps(String id, String header, Number width) {
    this.id = id;
    this.header = header;
    this.width = width;
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


  public static RazzleCustomTableColumnProps with(String id, String header, Number width) {
    var props = new RazzleCustomTableColumnProps();
    props.id = id;
    props.header = header;
    props.width = width;

    return props;
  }


  public static RazzleCustomTableColumnProps with(String id, String header) {
    var props = new RazzleCustomTableColumnProps();
    props.id = id;
    props.header = header;

    return props;
  }

}
