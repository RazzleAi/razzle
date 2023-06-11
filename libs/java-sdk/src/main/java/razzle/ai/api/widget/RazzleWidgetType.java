package razzle.ai.api.widget;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * created by Julian Duru on 25/02/2023
 */
@Getter
@RequiredArgsConstructor
public enum RazzleWidgetType {


    TEXT("text"),

    LIST("list"),

    LIST_ITEM("list-item"),

    CUSTOM_LIST("custom-list"),

    CUSTOM_LIST_ITEM("custom-list-item"),

    LINK("link"),

    TABLE("table"),

    TABLE_COLUMN("table-column"),

    CUSTOM_TABLE("custom-table"),

    CUSTOM_TABLE_COLUMN("custom-table-column"),

    CUSTOM_TABLE_ROW("custom-table-row"),

    CUSTOM_TABLE_CELL("custom-table-cell"),

    SELECTABLE("selectable"),

    ROW("row"),

    COLUMN("column"),

    CONTAINER("container");


    private final  String value;


}

