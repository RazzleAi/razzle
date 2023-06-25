package razzle.ai.api;

/**
 * created by julian on 14/02/2023
 */
public class ActionPlanWithDetails {

  private String uuid;

  private String appId;

  private String appName;

  private String appDescription;

  private String actionName;

  private ActionPlanArgsString[] args;

  private Boolean isError;


  public String getUuid() {
    return uuid;
  }

  public String getAppId() {
    return appId;
  }

  public String getAppName() {
    return appName;
  }

  public String getAppDescription() {
    return appDescription;
  }

  public String getActionName() {
    return actionName;
  }

  public ActionPlanArgsString[] getArgs() {
    return args;
  }

  public Boolean getError() {
    return isError;
  }


}

