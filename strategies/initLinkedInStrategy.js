/*****                                           *****/
/*   PASSPORT LINKED IN IS CURRENTLY AWAITING UPDATE */
/*****                                           *****/

const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

function initLinkedInStrategy(usersDAO) {

    passport.use(
        new LinkedInStrategy(
            {
                clientID: process.env.LINKEDIN_CLIENT_ID,
                clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
                callbackURL: 'http://localhost:8282/auth/linkedin/callback',
                profileFields: [
                    "id",
                    "first-name",
                    "last-name",
                    "email-address",
                    "picture-url",
                    "public-profile-url"
                ],
                scope: ['r_emailaddress', 'r_basicprofile'],
                state: true,
                passReqToCallback: true
            },
            async (accessToken, refreshToken, profile, done) => {
                process.nextTick(()=>done(null, profile))
                // try {
                //     const existingUser = await usersDAO.getUser({ LinkedInId: profile.id });
                //     if (existingUser) {
                //         return done(null, existingUser._id);
                //     }
                //     try {
                //         const newUser = await usersDAO.addLinkedInUser(profile);
                //         // console.log({newUser})
                //         return done(null, newUser);
                //     } catch (err) {
                //         console.log("Unable to create new User!")
                //         console.error(JSON.stringify(err, null, 2))
                //         return done(err, null)
                //     }
                // } catch(err) {
                //     console.log("Unable to query DB!!")
                //     console.error(JSON.stringify(err, null, 2))
                //     return done(err, null)
                // }
            },
        ),
    );
}

module.exports = initLinkedInStrategy