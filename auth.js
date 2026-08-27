const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const { users } = require("./db");

// Passport Local Strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = users.find((u) => u.username === username);

      if (!user) {
        return done(null, false, { message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// Store user ID in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Retrieve user from the session
passport.deserializeUser((id, done) => {
  const user = users.find((u) => u.id === id);

  if (user) {
    done(null, user);
  } else {
    done(null, false);
  }
});

module.exports = passport;