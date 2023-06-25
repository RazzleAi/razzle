package razzle.ai.api.widget;


import java.util.ArrayList;
import java.util.List;

/**
 * created by Julian Duru on 25/02/2023
 */
public abstract class RazzleWidget implements IRazzleWidget {


  protected List<RazzleWidget> children = new ArrayList<>();

  public abstract String getType();

  public abstract IRazzleWidget toJSON();

  protected abstract void validate() throws IllegalStateException;


  @Override
  public List<RazzleWidget> getChildren() {
    return children;
  }


}
