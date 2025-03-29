const express = require("express");
const session = require("express-session");
const path = require("path");
const { User, Trip, Expense } = require("./mongodb");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: "secret-key", resave: false, saveUninitialized: true }));
app.use(express.static("public"));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../templates"));

// Routes
app.get("/", (req, res) => res.render("index"));
app.get("/signup", (req, res) => res.render("signup"));
app.get("/login", (req, res) => res.render("login"));

// Signup Route
app.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    if (await User.findOne({ email })) {
        return res.send("⚠️ Email already exists! Try logging in.");
    }
    await new User({ email, password }).save();
    res.redirect("/login");
});

// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
        return res.send("⚠️ Invalid email or password!");
    }

    req.session.userId = user._id; // Store user ID in session
    res.redirect("/home");
});

// Home Page (Unique per User)
app.get("/home", async (req, res) => {
    if (!req.session.userId) return res.redirect("/login");

    const user = await User.findById(req.session.userId);
    const trips = await Trip.find({ userId: req.session.userId });
    const expenses = await Expense.find({ userId: req.session.userId });

    res.render("home", { email: user.email, trips, expenses });
});

// Add New Trip
app.post("/add-trip", async (req, res) => {
    if (!req.session.userId) return res.redirect("/login");

    const { tripName, location, startDate, endDate, budget } = req.body;
    await new Trip({ userId: req.session.userId, tripName, location, startDate, endDate, budget }).save();

    res.redirect("/home");
});

// Add New Expense
app.post("/add-expense", async (req, res) => {
    if (!req.session.userId) return res.redirect("/login");

    const { category, amount, date } = req.body;
    await new Expense({ userId: req.session.userId, category, amount, date }).save();

    res.redirect("/home");
});

// Logout Route
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// Start Server
app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
