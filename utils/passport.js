const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

function initGoogleStrategy(userDAO) {

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser(async (userID, done) => {
        const foundUser = await userDAO.getUser({id: userID})
        done(null, foundUser);
    });

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/auth/google/callback',
                proxy: true,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const existingUser = await userDAO.getUser({ googleId: profile.id });
                    if (existingUser) {
                        return done(null, existingUser._id);
                    }
                    try {
                        const newUser = await userDAO.addUser(profile);
                        // console.log({newUser})
                        return done(null, newUser);
                    } catch (err) {
                        console.log("Unable to create new User!")
                        console.error({err})
                        return done(err, null)
                    }
                } catch(err) {
                    console.log("Unable to query DB!!")
                    console.error({err})
                    return done(err, null)
                }
            },
        ),
    );
}

module.exports = initGoogleStrategy