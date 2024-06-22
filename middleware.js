import jwt from "./helpers/auth.js"
import { isHR, isHROrSelf } from "./manageV1.js"

export default {
  ifValidJWT: jwt.middleware.ifValidJWT,
  ifNoValidJWT: jwt.middleware.ifNoValidJWT,
  isHR,
  isHROrSelf,
}
