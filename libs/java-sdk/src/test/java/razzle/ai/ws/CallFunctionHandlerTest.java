package razzle.ai.ws;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration;
import razzle.ai.RazzleAutoConfiguration;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * created by julian on 14/02/2023
 */
@SpringBootTest(
    classes = {
        RazzleAutoConfiguration.class,
    }
)
public class CallFunctionHandlerTest {


    @Autowired
    private CallFunctionHandler handler;



    @Test
    @Disabled
    public void testCallFunction() throws Exception {
        var serverRequest = handler.handleTextMessage(
        """
            {
              "event": "CallFunction",
              "data": {
                "headers": {
                  "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImFlYjMxMjdiMjRjZTg2MDJjODEyNDUxZThmZTczZDU4MjkyMDg4N2MiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiRHVtZWJpIER1cnUiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUVkRlRwNG5mb0NJdjBwNzFKd2tHdXRkZGdhSEQyR2JyMW42cG9oblpFTEw9czk2LWMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcmFhenpsZS1kZXYiLCJhdWQiOiJyYWF6emxlLWRldiIsImF1dGhfdGltZSI6MTY3NjQwNTIwNywidXNlcl9pZCI6IkhKOE1aQ2ZWOFpNcTdOekY4YTJudmpUM1FOMTIiLCJzdWIiOiJISjhNWkNmVjhaTXE3TnpGOGEybnZqVDNRTjEyIiwiaWF0IjoxNjc2NDA1MjA3LCJleHAiOjE2NzY0MDg4MDcsImVtYWlsIjoiZGR1cnVAdGVhbWFwdC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjExMTA5ODI0ODE0NzQ2MDk3NjcxNiJdLCJlbWFpbCI6WyJkZHVydUB0ZWFtYXB0LmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.3T2AfpQ7USnbESnh6ziUhNxK8wHFd83EANKd9As094KtsEOxvlyehFqFzO0dKIr3k91rBOA1xz2mYeEZLDecmkJ2qmhtJmUhwPjJTBWgvyj7_kOsYtN0usColW5ql6swGy0zWgX3a4ez8yNOPpwUK6yNO9nQUA8q-veXPFw93NO0kmv1nwF4Tic8xbvaIxKldV39hheOVTBfYL96_F2oUw4IHIfOf-RjK13Qg_ufKxrXG16fbkfPlhWB1twEqc8WMsKa90URg_TqPisEjuRR6rZbiH66oUbwq4INlfDOh88Y-8g1_tmTvtEwkCMQU49Jw7paiDOjigTDMYSPoSvLfw",
                  "clientId": "7e1ad71c77470fdb1b676971bade126e",
                  "workspaceId": "63ebe9fe49a1c55a625e8406",
                  "applicationId": "d13f16f42fd54344cd7b07def2247d00",
                  "userId": "63ebe9d849a1c55a625e8403",
                  "context": {},
                  "accountId": "63ebe9fe49a1c55a625e8404"
                },
                "payload": {
                  "uuid": "e8de2854-3eeb-4423-9579-f373eb2afb8b",
                  "actionName": "testAction",
                  "appDescription": "First app for Teamapt",
                  "appId": "d13f16f42fd54344cd7b07def2247d00",
                  "appName": "Teamapt-app",
                  "args": [
                    {
                      "name": "name",
                      "type": "java.lang.String",
                      "value": null
                    }
                  ]
                }
              }
            }
        """
        );
        assertThat(serverRequest).isNull();
    }


}

