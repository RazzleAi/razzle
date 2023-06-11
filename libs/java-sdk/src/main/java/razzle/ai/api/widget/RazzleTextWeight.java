package razzle.ai.api.widget;

/**
 * created by Julian Duru on 25/02/2023
 */
public enum RazzleTextWeight {


    light,

    normal,

    medium,

    semibold,

    bold;


    public String value() {
        return name().toLowerCase();
    }


}
