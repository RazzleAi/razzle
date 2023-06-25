package razzle.ai.api.widget;

import java.util.List;

/**
 * created by Julian Duru on 25/02/2023
 */
public interface IRazzleWidget {


    List<RazzleWidget> getChildren();


    String getType();


}
