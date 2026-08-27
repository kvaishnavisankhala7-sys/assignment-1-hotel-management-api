const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");

const passport = require("./auth");
const { users } = require("./db");
const hotelRoutes = require("./hotelRoutes");

const app = express();
const PORT = 3000;

// Parse JSON request bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(
        `${new Date().toISOString()} - ${req.method} ${req.originalUrl}`
    );
    next();
});

// Session configuration
app.use(
    session({
        secret: "hotel-management-secret",
        resave: false,
        saveUninitialized: false
    })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Welcome route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Hotel API"
    });
});

// Register
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email and password are required"
            });
        }

        const existingUser = users.find(
            (user) =>
                user.username === username ||
                user.email === email
        );

        if (existingUser) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: users.length + 1,
            username,
            email,
            password: hashedPassword
        };

        users.push(newUser);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
});

// Login
app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json({
                message: info?.message || "Login failed"
            });
        }

        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            res.json({
                message: "Login successful",
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        });
    })(req, res, next);
});

// Logout
app.post("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                message: "Logout failed"
            });
        }

        res.json({
            message: "Logout successful"
        });
    });
});

// Hotel routes
app.use("/hotels", hotelRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        message: "Internal server error"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Hotel API running on http://localhost:${PORT}`);
});