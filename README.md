# spotify-api-intro
This Repo is the result of a Chick Tech tutorial that teaches how to use Spotify's API with react.
It's a stylish app that allows users to control what is playing on their spotify player, search for
artists and swap out artists they don't like for ones they do.

There are two parts to it, the auth-server, and the client. 

## Getting Statrted

### 1) Create an App
- Visit https://developer.spotify.com/ 
- Log in and create an app
- Enter http//localhost:8888/callback as the redirect uri
- Save your changes
- Copy down the following: Redirect uri, client id, client secret


### 2)  Start Auth Server
- Navigate to the auth-server directory `cd server/server`
- Install the dependencies `npm install`
- In the authorization_code create a .env file
- Add this to the .env file
```
SPOTIFY_CLIENT_ID = 'Your client id'
SPOTIFY_CLIENT_SECRET = 'Your client secret'
```
- Run the Server `node authorization_code/app.js`

### 3)  Start Client
- Navigate to the auth-server directory `cd client`
- Install the dependencies `npm install`
- Run the Server `npm start`

### 4)  Use the App
- Make sure you have a song playing (or paused) on a Spotify app
- Visit http://localhost:3000
- Click 'Log in with Spotify' and log in
- You should be re-directed to the Spotify App and see what you are currently playing
