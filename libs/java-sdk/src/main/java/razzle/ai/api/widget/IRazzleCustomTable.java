package razzle.ai.api.widget;

import java.util.List;

/**
 * created by Julian Duru on 01/03/2023
 */
public interface IRazzleCustomTable<T extends IRazzleCustomTableColumn, R extends IRazzleCustomTableRow<?>> extends IRazzleWidget {


    String getTitle();

    List<T> getColumns();

    List<R> getRows();


}
