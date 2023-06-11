package razzle.ai.exception;

/**
 * created by julian on 09/02/2023
 */
public class SenderException extends RuntimeException {

    public SenderException() {
    }

    public SenderException(String message) {
        super(message);
    }

    public SenderException(String message, Throwable cause) {
        super(message, cause);
    }

    public SenderException(Throwable cause) {
        super(cause);
    }

    public SenderException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }


}
