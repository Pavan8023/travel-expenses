const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const User = require("./mongodb");

const templatePath = path.join(__dirname, "../templates");

app.use(express.static('public')); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));

app.set("view engine", "hbs");
app.set("views", templatePath);

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});


app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/contact", (req, res) => {
    res.render("contact");
});

app.get("/login", (req, res) => {
    res.render("login");
});

// Signup Route
app.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("Email already exists! Try logging in.");
        }

        // Create and save new user
        const newUser = new User({ email, password });
        await newUser.save();

        console.log("User Registered:", newUser);
        res.redirect("/"); // Redirect to login after signup
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).send("Error signing up");
    }
});

// Login Route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send("User not found");
        }

        // Check password
        if (user.password !== password) {
            return res.status(401).send("Incorrect password");
        }

        res.render("home"); // Render home page on successful login

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send("Error logging in");
    }
});

// Start the server (not needed for Vercel, but useful for local testing)
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Export the app for Vercel
module.exports = app;