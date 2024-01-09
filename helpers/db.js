import bcrypt from "bcrypt"
import dotenv from "dotenv"
import {
    DB_WRITE_FAILED_ERROR,
    INVALID_PASSWORD_ERROR,
    INVALID_USERNAME_ERROR,
    SUCCESS,
    USER_ALREADY_EXISTS_ERROR,
} from "../constants.js"
import User from "../userSchema.js"
import helper from "./auth.js"
if (!process.env.PRODUCTION) {
    dotenv.config()
}

const HASH_SALT = 10
const db = {
    addUser,
    comparePassword,
    deleteUser,
    getUser,
    updateUser,
}
export default db

/**
 *
 * @param {string} username
 * @param {password} password
 * @returns {Symbol("Success") | Symbol("InvalidUsernameError") | Symbol("InvalidPasswordError") | Symbol("UserAlreadyExistsError") | Symbol("DBWriteFailedError")}
 * @description Add a new user to the database
 */
async function addUser(username, password) {
    if (!helper.regex.verifyUsernameString(username))
        return INVALID_USERNAME_ERROR
    if (!helper.regex.verifyPasswordString(password))
        return INVALID_PASSWORD_ERROR
    if (await getUser(username)) return USER_ALREADY_EXISTS_ERROR
    const passwordHash = await bcrypt.hash(password, HASH_SALT)
    const user = new User({
        username,
        password: passwordHash,
    })
    return user
        .save()
        .then(() => SUCCESS)
        .catch(() => DB_WRITE_FAILED_ERROR)
}

/**
 * @param {string} username
 * @param {string | undefined} password - optional
 * @returns {Symbol("Success") | Symbol("InvalidUsernameError") | Symbol("InvalidPasswordError") | Symbol("DBWriteFailedError")}
 * @description Update a user's username and/or password
 */
async function updateUser(username, password) {
    if (!helper.regex.verifyUsernameString(username))
        return INVALID_USERNAME_ERROR
    if (!password) return await User.updateOne({ username }, { username })

    if (password && !helper.regex.verifyPasswordString(password))
        return INVALID_PASSWORD_ERROR

    const passwordHash = await bcrypt.hash(password, HASH_SALT)
    User.updateOne({ username }, { username, password: passwordHash })
        .then(() => SUCCESS)
        .catch(() => DB_WRITE_FAILED_ERROR)
}

/**
 * @param {string} username
 * @returns {Symbol("Success") | Symbol("InvalidUsernameError") | Symbol("DBWriteFailedError")}
 * @description Delete a user from the database
 */
async function deleteUser(username) {
    return User.deleteOne({ username })
        .then(() => SUCCESS)
        .catch(() => DB_WRITE_FAILED_ERROR)
}

/**
 * @param {string} username
 * @returns { object | Symbol("InvalidUsernameError")} - user object or INVALID_USERNAME_ERROR symbol
 * @description Get a user from the database
 */
async function getUser(username) {
    const user = User.findOne({ username })
    if (user) return user
    return INVALID_USERNAME_ERROR
}

/**
 * @param {string} password - plain text password from client
 * @param {string} hash - hashed password
 * @returns {Promise<boolean>} - true if password matches hash, false otherwise
 * @description Compare a password with a hash
 */
async function comparePassword(password, hash) {
    await bcrypt.compare(password, hash)
}
