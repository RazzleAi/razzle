package razzle.ai;

import razzle.ai.api.CallDetails;

/**
 * created by julian on 09/02/2023
 */
public interface AuthenticationFunction {


    String authenticate(String appId, CallDetails callDetails);


}

