package razzle.ai.api.widget;

/**
 * created by Julian Duru on 25/02/2023
 */
public class WidgetPadding implements IWidgetPadding {


  private Number top;

  private Number bottom;

  private Number left;

  private Number right;


  @Override
  public Number getTop() {
    return top;
  }

  @Override
  public Number getBottom() {
    return bottom;
  }

  @Override
  public Number getLeft() {
    return left;
  }

  @Override
  public Number getRight() {
    return right;
  }

  public static WidgetPadding DEFAULT;


  static {
    DEFAULT = new WidgetPadding();
    DEFAULT.top = 10;
    DEFAULT.bottom = 10;
    DEFAULT.left = 10;
    DEFAULT.right = 10;
  }


}

