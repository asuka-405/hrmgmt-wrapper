const SUCCESS = Symbol("Success")

const TOKEN_DURATION = 60 * 60 * 24 * 7
const TOKEN_EXPIRED_ERROR = Symbol("TokenExpiredError")
const INVALID_TOKEN_ERROR = Symbol("InvalidTokenError")

const INVALID_USERNAME_ERROR = Symbol("InvalidUsernameError")
const INVALID_PASSWORD_ERROR = Symbol("InvalidPasswordError")
const PASSWORD_COMPARE_FAILED = Symbol("PasswordCompareFailedError")
const PASSWORD_COMPARE_SUCCESS = Symbol("PasswordCompareSuccess")

const USER_ALREADY_EXISTS_ERROR = Symbol("UserAlreadyExistsError")
const DB_WRITE_FAILED_ERROR = Symbol("DBWriteFailedError")

export {
  DB_WRITE_FAILED_ERROR,
  INVALID_PASSWORD_ERROR,
  INVALID_TOKEN_ERROR,
  INVALID_USERNAME_ERROR,
  PASSWORD_COMPARE_FAILED,
  PASSWORD_COMPARE_SUCCESS,
  SUCCESS,
  TOKEN_DURATION,
  TOKEN_EXPIRED_ERROR,
  USER_ALREADY_EXISTS_ERROR,
}
