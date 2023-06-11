package razzle.ai.api.widget;

import java.util.List;

/**
 * created by Julian Duru on 01/03/2023
 */
public interface IRazzleCustomTableRow<T extends IRazzleCustomTableCell> extends IRazzleWidget {


    List<T> getCells();


}
