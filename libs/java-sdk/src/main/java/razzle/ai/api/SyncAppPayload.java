package razzle.ai.api;

import razzle.ai.ActionHandler;

import java.util.List;

/**
 * created by julian on 09/02/2023
 */
public class SyncAppPayload {

  private String sdkVersion;

  private boolean requiresAuth;

  private List<ActionHandler> actions;


  private SyncAppPayload(Builder builder) {
    this.sdkVersion = builder.sdkVersion;
    this.requiresAuth = builder.requiresAuth;;
    this.actions = builder.actions;
  }


  public static class Builder {

    private String sdkVersion;

    private boolean requiresAuth;

    private List<ActionHandler> actions;


    public Builder sdkVersion(String sdkVersion) {
      this.sdkVersion = sdkVersion;
      return this;
    }


    public Builder requiresAuth(boolean requiresAuth) {
      this.requiresAuth = requiresAuth;
      return this;
    }


    public Builder actions(List<ActionHandler> actions) {
      this.actions = actions;
      return this;
    }

    public SyncAppPayload build() {
      return new SyncAppPayload(this);
    }


  }


}

