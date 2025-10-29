import NextAuth from "next-auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    {
      id: "strava",
      name: "Strava",
      type: "oauth",
      clientId: "104687",
      clientSecret: "93ff8d5c0c02049c5667432fec55a47927e06fda",
      authorization: "https://www.strava.com/oauth/authorize?scope=read,activity:read_all&approval_prompt=auto",
      token: "https://www.strava.com/oauth/token",
      userinfo: "https://www.strava.com/api/v3/athlete",
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.firstname + " " + profile.lastname,
          email: profile.id + "@strava.local",
          image: profile.profile,
        }
      },
    },
  ],
  secret: "eZE1+oIEIrWMi0dmGCkMEBHT7ZyKB5wUe1wdy5IQB1s=",
  trustHost: true,
})