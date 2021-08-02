const express = require("express");
const User = require("../models/userModel.js");

const expressAsyncHandler = require("express-async-handler");

const data = require("../data.js");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { generateToken, isAdmin, isAuth } = require("../utils.js");

// const router = express.Router()

const userRouter = express.Router();
console.log("userRouter");

//seed data

// userRouter.get(
//   "/seed",
//   expressAsyncHandler(async (req, res) => {
//     // await User.remove({});
//     const createdUsers = await User.insertMany(data.users);
//     res.send({ createdUsers });
//   })
// );

userRouter.get("/seed", async (req, res) => {
  try {
    // await User.remove({});
    const createdUsers = await User.insertMany(data.users);
    res.send({ createdUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

///////// Getting all//////////////////////////////////////////////////////////////////////////////////////

userRouter.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    // res.json(users);
    res.send(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// userRouter.get(
//   "/",
//   isAuth,
//   isAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const users = await User.find({});
//     res.send(users);
//   })
// );


///////////////////////getUser()////////////////////////

async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: "Cannot find user" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.user = user;
  next();
}

////////////////////////// Getting One///////////////////////////////////////////////////

// userRouter.get("/:id", getUser, (req, res) => {
//   res.send(res.user);
// });

userRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

//////////////////////////////// Creating one///////////////////////////////////////////////////////

//////////register/////////////////

// userRouter.post("/register", async (req, res) => {
//   const user = new User({
//     name: req.body.name,
//     email: req.body.email,
//     password: bcrypt.hashSync(req.body.password, 8),
//   });
//   try {
//     const createdUser = await user.save();
//     res.status(201).send(createdUser);
//     // res.send({
//     //   _id: createdUser._id,
//     //   name: createdUser.name,
//     //   email: createdUser.email,
//     //   // image: createdUser.image,
//     //   isAdmin: createdUser.isAdmin,
//     //   // token: generateToken(createdUser),
//     // });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

userRouter.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      image: req.body.image,
      password: bcrypt.hashSync(req.body.password, 8),
    });
    const createdUser = await user.save();
    res.send({
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      image: createdUser.image,
      isAdmin: createdUser.isAdmin,
      token: generateToken(createdUser),
    });
  })
);

///////signin///////////////////////////////

// userRouter.post("/signin", async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });

//     if (user) {
//       if (bcrypt.compareSync(req.body.password, user.password)) {
//         res.send({
//           _id: user._id,
//           name: user.name,
//           email: user.email,
//           // image: user.image,
//           isAdmin: user.isAdmin,
//           token: generateToken(user),
//         });
//         return;
//       }
//     }

//     res.status(401).send({ message: "Invalid email or password" });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (!user.isActive)
        return res.status(401).send({ message: "this user is not active" });
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: "Invalid email or password" });
  })
);

///////////////////// Updating One//////////////////////////////////////////////////////////////////////////////////////////

// userRouter.patch("/:id", getUser, async (req, res) => {
//   if (req.body.name != null) {
//     res.user.name = req.body.name;
//   }
//   if (req.body.email != null) {
//     res.user.email = req.body.email;
//   }
//   try {
//     const updatedUser = await res.user.save();
//     // res.json(updatedUser);
//     res.send({ message: "User Updated", user: updatedUser });
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

userRouter.patch(
  "/:id",
  // isAuth,
  // isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      user.isAdmin = Boolean(req.body.isAdmin) || user.isAdmin;
      // user.isAdmin = req.body.isAdmin || user.isAdmin;
      const updatedUser = await user.save();
      res.send({ message: "User Updated", user: updatedUser });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

///////////// Deleting One ////////////////////////////////////////////////////////////////////////////////////////////////////////

userRouter.delete("/:id", getUser, async (req, res) => {
  try {
    await res.user.remove();
    res.send({ message: "User Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// userRouter.delete(
//   "/:id",
//   isAuth,
//   isAdmin,
//   expressAsyncHandler(async (req, res) => {
//     console.log('req:', req)
//     const user = await User.findById(req.params.id);
//     if (user) {
//       // console.log('user:', user)
//       if (user.email === "admin@example.com") {
//         res.status(400).send({ message: "Can Not Delete Admin User" });
//         return;
//       }
//       const deleteUser = await user.remove();

//       // user.isActive = !user.isActive;

//       await user.save();
//       res.send({ message: "User Deleted", user: user });
//     } else {
//       res.status(404).send({ message: "User Not Found" });
//     }
//   })
// );

///////////////////////////////////////////////////////////////////////

module.exports = userRouter;
