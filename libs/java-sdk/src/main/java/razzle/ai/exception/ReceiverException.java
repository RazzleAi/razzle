package razzle.ai.exception;

/**
 * created by julian on 09/02/2023
 */
public class ReceiverException extends RuntimeException {

    public ReceiverException() {
    }

    public ReceiverException(String message) {
        super(message);
    }

    public ReceiverException(String message, Throwable cause) {
        super(message, cause);
    }

    public ReceiverException(Throwable cause) {
        super(cause);
    }

    public ReceiverException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }

}
