const models = require("../models");

const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const validationInput = require("../utils/validationInput");

// @desc Register user & get token
// @route POST /users/register
// @access Public

const registerUser = async (req, res) => {
  const { name, email, password, addressId } = req.body;
  const userInfo = { name, email, password, addressId };

  const schema = {
    name: { type: "string", optional: false, max: 100 },
    email: { type: "string", optional: false, max: 100 },
    password: { type: "string", optional: false, max: 100 },
    addressId: { type: "number", optional: false, max: 10 },
  };

  validationInput(userInfo, schema, res);

  try {
    const emailAlreadyExist = await models.User.findOne({ where: { email } });

    if (emailAlreadyExist) {
      res.status(409).json({ message: "Email already exists" });
    } else {
      const hashedPassword = bcrypt.hashSync(password, 10);

      const user = { name, email, password: hashedPassword, addressId, roleId: 333 }; //  Only admins could change the users roles later

      await models.User.create(user);
      generateToken(res, user.email, user.id);
      res.status(201).json({ message: "User created successfully" });
    }
  } catch (error) {
    console.error("Error user registration", error);
    res.status(500).json({ message: "Failed to register user", error });
  }
};

// @desc Auth user & get token
// @route POST /users/auth
// @access Public

authUser = async (req, res) => {
  const { email, password } = req.body;
  const userInfo = { email, password };

  const schema = {
    email: { type: "string", optional: false, max: 100 },
    password: { type: "string", optional: false, max: 100 },
  };

  validationInput(userInfo, schema, res);

  try {
    const user = await models.User.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(res, user.email, user.id);

      return res.status(200).json({ message: "User authenticated", token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error user authentication :", error);
    res.status(500).json({ message: "Failed to authenticate user", error });
  }
};

module.exports = { registerUser, authUser };
