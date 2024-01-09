import dotenv from "dotenv"
import { Router } from "express"
import {
    DB_WRITE_FAILED_ERROR,
    INVALID_PASSWORD_ERROR,
    INVALID_TOKEN_ERROR,
    INVALID_USERNAME_ERROR,
    TOKEN_EXPIRED_ERROR,
    USER_ALREADY_EXISTS_ERROR,
} from "./constants.js"
import helper from "./helpers/auth.js"
import db from "./helpers/db.js"

if (!process.env.PRODUCTION) {
    dotenv.config()
}

const auth = Router()

/**
 * @description Middleware to check if the user has a valid JWT token
 * only allow access to routes if the user dont have a valid JWT token
 * @response 200 - if the user has a valid JWT token
 * @next - if the user does not have a valid JWT token
 */
auth.use((req, res, next) => {
    const token = req.headers["authorization"].split(" ")[1]
    const decoded = helper.token.verifyJWT(token)
    if (decoded === INVALID_TOKEN_ERROR || decoded === TOKEN_EXPIRED_ERROR)
        return next()
    res.status(200).json({
        message: "Already logged in as " + decoded.username,
    })
})

/**
 * @route POST /auth/login
 * @description Login route
 * @response 200 - success
 * @response 401 - invalid username
 * @response 401 - invalid password
 * @response
 */
auth.post("/login", (req, res) => {
    const { username, password } = req.body
    const user = db.getUser(username)
    let statusCode = 401
    const json = {}
    let token
    if (user === INVALID_USERNAME_ERROR) {
        statusCode = 401
        json.message = "Invalid username"
    } else if (!db.comparePassword(password, user.password)) {
        statusCode = 401
        json.message = "Invalid password"
    } else {
        token = helper.token.generateJWT(username)
        if (token === INVALID_USERNAME_ERROR) {
            statusCode = 401
            json.message = "Invalid username"
        } else {
            statusCode = 200
            json.username = username
            json.token = token
            json.message = "success"
        }
    }

    res.status(statusCode).json(json)
})

auth.post("/register", (req, res) => {
    const { username, password } = req.body
    let statusCode = 500
    let json = {}
    if (!helper.regex.verifyUsernameString(username)) {
        statusCode = 401
        json.message = "Invalid username"
    }
    if (!helper.regex.verifyPasswordString(password)) {
        statusCode = 401
        json.message = "Invalid password"
    }

    const userCreationStatus = db.addUser(username, password)
    switch (userCreationStatus) {
        case INVALID_USERNAME_ERROR:
            statusCode = 401
            json.message = "Invalid username"
            break
        case INVALID_PASSWORD_ERROR:
            statusCode = 401
            json.message = "Invalid password"
            break
        case USER_ALREADY_EXISTS_ERROR:
            statusCode = 409
            json.message = "User already exists"
            break
        case DB_WRITE_FAILED_ERROR:
            statusCode = 500
            json.message = "Database write failed"
            break
        default:
            statusCode = 200
            const token = helper.token.generateJWT(username)
            json = {
                username,
                token,
                message: "success",
            }
            break
    }
    res.status(statusCode).json(json)
})

auth.get("/login", (req, res) => {
    res.send("Login page")
})
auth.get("/register", (req, res) => {
    res.send("Register page")
})

export default auth
