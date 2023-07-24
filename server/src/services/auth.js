import db from "../models/";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

const hashPassword = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(12));

export const registerService = ({ name, phone, password }) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findOrCreate({
        where: { phone },
        defaults: {
          id: v4(),
          name: name,
          phone: phone,
          password: hashPassword(password),
          zalo: phone,
        },
      });
      const token =
        response[1] &&
        jwt.sign(
          {
            id: response[0].id,
            phone: response[0].phone,
          },
          process.env.SECRET_KEY,
          {
            expiresIn: "2d",
          }
        );
      resolve({
        err: token ? 0 : 2,
        msg: token
          ? "Register is successfully"
          : "Numberphone is already registered",
        token: token || null,
      });
    } catch (error) {
      reject(error);
    }
  });

export const loginService = ({ phone, password }) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findOne({
        where: { phone },
        raw: true,
      });
      const isCorrectPassword =
        response && bcrypt.compareSync(password, response.password);
      const token =
        isCorrectPassword &&
        jwt.sign(
          {
            id: response.id,
            phone: response.phone,
          },
          process.env.SECRET_KEY,
          {
            expiresIn: "2d",
          }
        );
      resolve({
        err: token ? 0 : 2,
        msg: token
          ? "Login is successfully"
          : response
          ? "Password is not correct"
          : "Phone is not available",
        token: token || null,
      });
    } catch (error) {
      reject(error);
    }
  });
