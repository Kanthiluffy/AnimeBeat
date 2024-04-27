const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Artist = require("../models/Artist");
const bcrypt = require("bcrypt");
const {getToken} = require("../utils/helpers");

// This POST route will help to register a user
router.post("/register", async (req, res) => {
    // This code is run when the /register api is called as a POST request

    // My req.body will be of the format {email, password, firstName, lastName, username }
    const {email, password, firstName, lastName, username} = req.body;

    // Step 2 : Does a user with this email already exist? If yes, we throw an error.
    const user = await User.findOne({email: email});
    if (user) {
        // status code by default is 200
        return res
            .status(403)
            .json({error: "A user with this email already exists"});
    }
    // This is a valid request

    // Step 3: Create a new user in the DB
    // Step 3.1 : We do not store passwords in plain text.
    // xyz: we convert the plain text password to a hash.
    // xyz --> asghajskbvjacnijhabigbr
    // My hash of xyz depends on 2 parameters.
    // If I keep those 2 parameters same, xyz ALWAYS gives the same hash.
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserData = {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
    };
    const newUser = await User.create(newUserData);
    console.log(newUserData);

    // Step 4: We want to create the token to return to the user
    const token = await getToken(email, newUser);
    const role = "user";
    // Step 5: Return the result to the user
    const userToReturn = {...newUser.toJSON(), token, role};
    console.log(userToReturn);
    delete userToReturn.password;
    return res.status(200).json(userToReturn);
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    const user = await User.findOne({ email: email });
    console.log("****************************")
    if (!user) {
        return res.status(403).json({ error: "Invalid Credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        return res.status(403).json({ error: "Invalid Credentials" });
    }

    const token = await getToken(email, user);
    const role = "user";
    console.log(email);
    console.log(token);
    console.log("*************************");
    console.log(user.email);
    console.log(user);
    const userToReturn = { ...user.toJSON(), token, role };
    delete userToReturn.password;

    return res.status(200).json(userToReturn);
});

router.post("/logout", async (req, res) => {
    // Set token to none and expire after 5 seconds
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true,
    })
    res.status(200).json({ success: true, message: 'User logged out successfully' })
})

router.post("/artistlogin", async (req, res) => {
    const { email, password } = req.body;
    const user = await Artist.findOne({ email: email });
    console.log("****************************")
    if (!user) {
        return res.status(403).json({ error: "Invalid Credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        return res.status(403).json({ error: "Invalid Credentials" });
    }

    const token = await getToken(email, user);
    const role = "artist";
    const userToReturn = { ...user.toJSON(), token, role };
    delete userToReturn.password;

    return res.status(200).json(userToReturn);
});

router.post("/artistregister", async (req, res) => {
    // This code is run when the /register api is called as a POST request

    // My req.body will be of the format {email, password, firstName, lastName, username }
    const {email, password, firstName, lastName, username} = req.body;

    // Step 2 : Does a user with this email already exist? If yes, we throw an error.
    const user = await Artist.findOne({email: email});
    if (user) {
        // status code by default is 200
        return res
            .status(403)
            .json({error: "A artist with this email already exists"});
    }
    // This is a valid request

    // Step 3: Create a new user in the DB
    // Step 3.1 : We do not store passwords in plain text.
    // xyz: we convert the plain text password to a hash.
    // xyz --> asghajskbvjacnijhabigbr
    // My hash of xyz depends on 2 parameters.
    // If I keep those 2 parameters same, xyz ALWAYS gives the same hash.
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserData = {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
    };
    const newUser = await Artist.create(newUserData);
    console.log(newUserData);

    // Step 4: We want to create the token to return to the user
    const token = await getToken(email, newUser);
    const role = "artist";
    // Step 5: Return the result to the user
    const userToReturn = {...newUser.toJSON(), token, role};
    console.log(userToReturn);
    delete userToReturn.password;
    return res.status(200).json(userToReturn);
});

module.exports = router;
