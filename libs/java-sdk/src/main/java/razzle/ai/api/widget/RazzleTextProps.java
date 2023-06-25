package razzle.ai.api.widget;

/**
 * created by Julian Duru on 25/02/2023
 */
public class RazzleTextProps {


  private String text;


  private WidgetPadding padding = WidgetPadding.DEFAULT;


  private RazzleTextSize textSize;


  private String textColor;


  private RazzleTextWeight textWeight;


  public String getText() {
    return text;
  }


  public WidgetPadding getPadding() {
    return padding;
  }


  public RazzleTextSize getTextSize() {
    return textSize;
  }


  public String getTextColor() {
    return textColor;
  }


  public RazzleTextWeight getTextWeight() {
    return textWeight;
  }


  public static RazzleTextProps with(String text) {
    var props = new RazzleTextProps();
    props.text = text;

    return props;
  }


  public static RazzleTextProps with(String text, WidgetPadding padding) {
    var props = new RazzleTextProps();
    props.text = text;
    props.padding = padding;

    return props;
  }


}


