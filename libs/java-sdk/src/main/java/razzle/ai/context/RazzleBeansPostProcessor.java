package razzle.ai.context;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import razzle.ai.ActionHandler;
import razzle.ai.ActionHandlerParameter;
import razzle.ai.RazzleConstants;
import razzle.ai.annotation.Action;
import razzle.ai.annotation.ActionParam;
import razzle.ai.api.widget.RazzleResponse;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.ArrayList;

/**
 * created by julian on 09/02/2023
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RazzleBeansPostProcessor implements BeanPostProcessor {


    private final RazzleActionHandlersContainer handlerContainer;


    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if (hasActions(bean)) {
            log.debug("Encountered Bean with actions: {}", beanName);
            registerActions(bean);
        }

        return bean;
    }


    private boolean hasActions(Object bean) {
        var methods = bean.getClass().getMethods();
        boolean actionPresent = false;

        for (Method method: methods) {
            if (method.isAnnotationPresent(Action.class)) {
                actionPresent = true;
                break;
            }
        }

        return actionPresent;
    }

    /**
     *
     * @param bean
     */
    private void registerActions(Object bean) {
        var methods = bean.getClass().getMethods();

        for (Method method: methods) {
            if (method.isAnnotationPresent(Action.class)) {
                var action = method.getAnnotation(Action.class);
                var name = action.name();
                var description = action.description();
                var roles = action.roles();
                var stealth = action.stealth();

                var returnType = method.getReturnType();
                if (returnType != RazzleResponse.class) {
                    throw new RuntimeException(
                        "Action method should return a RazzleResponse"
                    );
                }

                var methodParameters = method.getParameters();

                // validate last method parameter is CallDetails
                boolean hasCallDetails = false;

                if (methodParameters.length > 0) {
                    var lastParam = methodParameters[methodParameters.length - 1];
                    if (!lastParam.getType().getName().equals(RazzleConstants.CALL_DETAILS_CLASS)) {
                        // validate last param has ActionParam annotation
                        var annotation = lastParam.getAnnotation(ActionParam.class);
                        if (annotation == null) {
                            throw new RuntimeException(
                                String.format(
                                    "Last method parameter should be a CallDetails %s or " +
                                        "have an @ActionParam annotation",
                                    RazzleConstants.CALL_DETAILS_CLASS
                                )
                            );
                        }
                    }
                    else {
                        hasCallDetails = true;
                    }
                }

                var parameters = new ArrayList<ActionHandlerParameter>();
                for (var i = 0; i < (hasCallDetails ? methodParameters.length - 1 : methodParameters.length); i++) {
                    var parameter = methodParameters[i];
                    var annotation = parameter.getAnnotation(ActionParam.class);
                    if (annotation != null) {
                        var paramName = annotation.name();
                        var paramType = parameter.getType().getName();

                        if (!ActionParamTypeMapping.isSupportedParamType(paramType)) {
                            throw new RuntimeException(
                                String.format(
                                    "Unsupported parameter type: %s. Supported types are: %s",
                                    paramType,
                                    ActionParamTypeMapping.getSupportedParamTypes()
                                )
                            );
                        }

                        paramName = StringUtils.hasText(paramName) ? paramName : parameter.getName();
                        parameters.add(
                            new ActionHandlerParameter(
                                paramName, ActionParamTypeMapping.getKeyForParamType(paramType)
                            )
                        );
                    }
                    else {
                        if (i !=  methodParameters.length - 1) {
                            throw new RuntimeException (
                                "The only parameter allowed not to have an @ActionParam annotation " +
                                    "is the last parameter which should be a CallDetails"
                            );
                        }
                    }
                }

                log.debug("Registering action: {} - {}", name, description);
                handlerContainer.registerHandler(
                    name,
                    ActionHandler.builder()
                        .bean(bean)
                        .method(method)
                        .parameters(parameters.toArray(new ActionHandlerParameter[0]))
                        .name(name)
                        .description(description)
                        .roles(roles)
                        .stealth(stealth)
                        .build()
                );
            }
        }
    }


}

