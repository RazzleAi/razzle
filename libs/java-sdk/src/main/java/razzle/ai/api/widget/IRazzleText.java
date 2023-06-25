package razzle.ai.api.widget;

/**
 * created by Julian Duru on 25/02/2023
 */
public interface IRazzleText extends IRazzleWidget {


    String getText();


    IWidgetPadding getPadding();


    RazzleTextSize getTextSize();


    RazzleTextWeight getTextWeight();


    String getTextColor();




}
