package razzle.ai;

import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;


@SpringBootTest(
	classes = {
		RazzleAutoConfiguration.class,
	}
)
class RazzleSdkAutoConfigurationTests {


	@Test
	void contextLoads() throws Exception {
		// Thread.currentThread().join();
	}


}

