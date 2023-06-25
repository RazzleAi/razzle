package razzle.ai.api.widget;

import java.util.List;

/**
 * created by Julian Duru on 26/02/2023
 */
public class RazzleListProps {


  private String title;


  private List<RazzleListItemProps> items;


  public RazzleListProps items(RazzleListItemProps... items) {
    this.items = List.of(items);
    return this;
  }


  public String getTitle() {
    return title;
  }

  public List<RazzleListItemProps> getItems() {
    return items;
  }

  public static RazzleListProps of(String title, RazzleListItemProps... items) {
    var props = new RazzleListProps();
    props.title = title;
    props.items = List.of(items);

    return props;
  }


}

