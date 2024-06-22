import axios from "axios"
import crypto from "crypto"
import FormData from "form-data"
import fs from "fs"
import {
  PASSWORD_COMPARE_FAILED,
  PASSWORD_COMPARE_SUCCESS,
} from "../constants.js"

const BASE_URL = "http://localhost:3001/core/cru"
const core = {
  findAll,
  create,
  find,
  update,
  batchCreate,
  BASE_URL,
  comparePassword,
}

export default core

async function findAll() {
  return await axios.get(BASE_URL).then((res) => res.data)
}

async function create(user) {
  return await axios
    .post(BASE_URL, user, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data)
}

async function find(username) {
  return await axios.get(`${BASE_URL}/${username}`).then((res) => res.data)
}

async function update(user) {
  return await axios
    .put(`${BASE_URL}/${user.username}`, user, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data)
    .catch((err) => {
      console.log(err)
      return err
    })
}

async function batchCreate(dlfPath) {
  const formData = new FormData()
  formData.append("file", fs.createReadStream(dlfPath))

  const headers = {
    "Content-Type": "multipart/form-data",
    ...formData.getHeaders(),
  }

  return await axios
    .post(`${BASE_URL}/batch/dlf`, formData, {
      headers,
    })
    .then((res) => res.data)
}

async function comparePassword(passwordString, passwordHash) {
  crypto.createHash("sha256").update(passwordString).digest("hex") ===
  passwordHash
    ? PASSWORD_COMPARE_SUCCESS
    : PASSWORD_COMPARE_FAILED
}
