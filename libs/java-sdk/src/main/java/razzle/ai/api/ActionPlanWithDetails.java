package razzle.ai.api;

import lombok.Data;

/**
 * created by julian on 14/02/2023
 */
@Data
public class ActionPlanWithDetails {


    private String uuid;

    private String appId;

    private String appName;

    private String appDescription;

    private String actionName;

    private ActionPlanArgsString[] args;

    private Boolean isError;

}

