import { check } from "express-validator";

export default [
    check("email").isEmail(),
    check("last_name").isLength({ min: 3 }),
    check("first_name").isLength({ min: 3 }),
    check("password").isLength({ min: 8 })
];
