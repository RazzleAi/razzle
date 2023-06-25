package razzle.ai;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.lang.reflect.Method;

/**
 * created by julian on 09/02/2023
 */
public class ActionHandler {


  private String name;


  private String description;


  @JsonIgnore
  private Object bean;


  @JsonIgnore
  private Method method;


  private ActionHandlerParameter[] parameters;


  private ActionHandler(Builder builder) {
    this.name = builder.name;
    this.description = builder.description;
    this.bean = builder.bean;
    this.method = builder.method;
    this.parameters = builder.parameters;
  }


  public Object getBean() {
    return bean;
  }


  public Method getMethod() {
    return method;
  }


  public static class Builder {

    private Object bean;

    private Method method;

    private ActionHandlerParameter[] parameters;

    private String name;

    private String description;


    public Builder bean(Object bean) {
      this.bean = bean;
      return this;
    }


    public Builder method(Method method) {
      this.method = method;
      return this;
    }


    public Builder parameters(ActionHandlerParameter[] parameters) {
      this.parameters = parameters;
      return this;
    }


    public Builder name(String name) {
      this.name = name;
      return this;
    }


    public Builder description(String description) {
      this.description = description;
      return this;
    }


    public ActionHandler build() {
      return new ActionHandler(this);
    }


  }


}

