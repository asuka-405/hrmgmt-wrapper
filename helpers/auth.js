import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import {
    INVALID_TOKEN_ERROR,
    INVALID_USERNAME_ERROR,
    TOKEN_DURATION,
    TOKEN_EXPIRED_ERROR,
} from "../constants.js"
if (!process.env.PRODUCTION) {
    dotenv.config()
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const helper = {
    middleware: {
        dontHaveValidJWT,
        hasValidJWT,
    },
    token: {
        generateJWT,
        verifyJWT,
    },
    regex: {
        verifyPasswordString,
        verifyUsernameString,
    },
}

export default helper
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 * @param {string} username
 * @returns {string | Symbol("InvalidUsernameError")}
 * @description Generate a JWT token with the username
 */
function generateJWT(username) {
    if (!username || !verifyUsernameString(username))
        return INVALID_USERNAME_ERROR

    return jwt.sign({ username }, process.env.JWT_SECRET, {
        expiresIn: TOKEN_DURATION,
    })
}

/**
 *
 * @param {string} token - jwt: provided as authorization header by client
 * @returns { jwt | Symbol("InvalidTokenError") | Symbol("TokenExpiredError") }
 *
 * @typedef {Object} decoded
 * @property {string} username
 *
 */
function verifyJWT(token) {
    if (!token) return INVALID_TOKEN_ERROR
    return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (decoded) return decoded
        else if (err.name === "TokenExpiredError") return TOKEN_EXPIRED_ERROR
        return INVALID_TOKEN_ERROR
    })
}

/**
 *
 * @middleware hasValidJWT
 * @description Checks if the request has a valid JWT token
 * @response 401 - invalid token
 * @response 401 - token expired
 * @next - passes control to the next middleware
 */
function hasValidJWT(req, res, next) {
    const token = req.headers["authorization"]
    const decoded = verifyJWT(token)

    if (typeof decoded !== "symbol") {
        req.user = decoded
        return next()
    } else if (decoded === TOKEN_EXPIRED_ERROR) {
        return res.status(401).json({
            message: "Token expired",
        })
    } else
        return res.status(401).json({
            message: "Invalid token",
        })
}

/**
 *
 * @middleware dontHaveValidJWT
 * @description Checks if the request has a valid JWT token
 * @response 401 - already logged in
 * @next - passes control to the next middleware
 */
function dontHaveValidJWT(req, res, next) {
    const token = req.headers["authorization"]
    const decoded = verifyJWT(token)

    if (typeof decoded === "symbol") return next()

    res.status(401).json({
        message: "Already logged in as " + decoded.username,
    })
}

/**
 *
 * @param {string} username
 * @returns {boolean}
 * @description Checks if the username is valid
 * @validUsername - starts with a letter, contains only letters, numbers and underscores, length 1-16
 */
function verifyUsernameString(username) {
    if (!username) return false
    const regex = /^[a-zA-Z][a-zA-Z0-9_]{0,16}$/
    return regex.test(username)
}

/**
 *
 * @param {string} password
 * @returns {boolean}
 * @description Checks if the password is valid
 * @validPassword - contains only letters, numbers, underscores, @ and #, length 8-16
 */
function verifyPasswordString(password) {
    if (!password) return false
    const regex = /^[a-zA-Z0-9_@#]{8,16}$/
    return regex.test(password)
}
