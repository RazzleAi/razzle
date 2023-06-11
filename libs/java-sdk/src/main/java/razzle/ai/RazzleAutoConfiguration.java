package razzle.ai;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import razzle.ai.config.RazzleConfig;


@Configuration
@ComponentScan(
	basePackages = {
		"razzle.ai",
	}
)
@EnableConfigurationProperties(
	value = {
		RazzleConfig.class,
	}
)
public class RazzleAutoConfiguration {


}
