package razzle.ai;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.lang.reflect.Method;

/**
 * created by julian on 09/02/2023
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActionHandler {


    @JsonIgnore
    private Object bean;


    @JsonIgnore
    private Method method;


    private ActionHandlerParameter[] parameters;


    private String name;


    private String description;


    private String[] roles;


    private boolean stealth;


}

