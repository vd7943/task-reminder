import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "dotenv";
import User from "../model/user.model.js";

config();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.findOne({ githubId: profile.id });

          if (!user) {
            user = new User({
              fullname: profile.displayName || profile.username,
              email: email || `${profile.id}@github.com`,
              githubId: profile.id,
              password: "",
              profileImage: {
                public_id: profile.id,
                url: profile.photos?.[0]?.value || "",
              },
              role: "User",
            });

            await user.save();
          } else {
            user.email = email;
            await user.save();
          }
        } else {
          if (!user.githubId) {
            user.githubId = profile.id;
            await user.save();
          }
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.findOne({ googleId: profile.id });

          if (!user) {
            user = new User({
              fullname: profile.displayName,
              email: email,
              googleId: profile.id,
              password: "",
              profileImage: {
                public_id: profile.id,
                url: profile.photos?.[0]?.value || "",
              },
              role: "User",
            });

            await user.save();
          } else {
            user.email = email;
            await user.save();
          }
        } else {
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
