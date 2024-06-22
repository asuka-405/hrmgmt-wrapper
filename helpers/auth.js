import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import {
  INVALID_TOKEN_ERROR,
  TOKEN_DURATION,
  TOKEN_EXPIRED_ERROR,
} from "../constants.js"
if (!process.env.PRODUCTION) {
  dotenv.config()
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const helper = {
  middleware: {
    ifNoValidJWT,
    ifValidJWT,
  },
  token: {
    generateJWT,
    verifyJWT,
  },
  // regex: {
  //   verifyPasswordString,
  //   verifyUsernameString,
  // },
}

export default helper
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function generateJWT(username) {
  return jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_DURATION,
  })
}

function verifyJWT(token) {
  if (!token) return INVALID_TOKEN_ERROR
  return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (decoded) return decoded
    else if (err.name === "TokenExpiredError") return TOKEN_EXPIRED_ERROR
    return INVALID_TOKEN_ERROR
  })
}

function ifValidJWT(req, res, next) {
  const token = req.cookies.jwt
  const decoded = verifyJWT(token)
  if (typeof decoded !== "symbol") {
    req.user = decoded
    return next()
  }
  return res.redirect("/login")
}

function ifNoValidJWT(req, res, next) {
  const token = req.cookies.jwt
  const decoded = verifyJWT(token)
  if (typeof decoded === "symbol") return next()
  res.redirect("/dashboard")
}

// /**
//  *
//  * @param {string} username
//  * @returns {boolean}
//  * @description Checks if the username is valid
//  * @validUsername - starts with a letter, contains only letters, numbers and underscores, length 1-16
//  */
// function verifyUsernameString(username) {
//   if (!username) return false
//   const regex = /^[a-zA-Z][a-zA-Z0-9_]{0,16}$/
//   return regex.test(username)
// }

// /**
//  *
//  * @param {string} password
//  * @returns {boolean}
//  * @description Checks if the password is valid
//  * @validPassword - contains only letters, numbers, underscores, @ and #, length 8-16
//  */
// function verifyPasswordString(password) {
//   if (!password) return false
//   const regex = /^[a-zA-Z0-9_@#]{8,16}$/
//   return regex.test(password)
// }
