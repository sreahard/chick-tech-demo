## Preface — Understand The Process
First things first, here’s what I’m assuming
You have installed: npm, create-react-app
You understand the basics of: Git, Node, Express, REST APIs, Promises, React
You have a Spotify Account
Note: It will be easier if you use your browser in incognito, or make sure that your login sessions aren’t stored, as you’ll likely need to login several times as we build up this app, and you don’t want to have to manually log out each time.

Before we do anything, let’s step back and get an overview of the process we’ll be going through. Spotify’s API has great documentation, and in there. they describe the 3 types of authorisation flows you can go through to use their API. The one we’ll be using today is the authorisation code flow, that uses Oauth 2.0. Here’s the diagram they provide.


If you’ve ever used and app that asked you to log in with Facebook, Google etc., then you’ve used Oauth. It basically allows your app to get authorised by Spotify and return to your app’s redirect URI with an access code, which will allow your app to access that users’ Spotify information.

Your will then go to Spotify and exchange that authorisation code for an access_token, which be used to make API calls.

Note: The token will expire after 60 minutes. The response object in which you initially get the token also contains a refresh token. You can use it to request a new access token. We won’t be doing that here, but the repo we will clone has an example that you can use and modify, and perhaps even set up to run automatically when your token nears expiration. This tutorial should take you well under an hour, but just in case, simply logging in again should be enough to get a new token.

## 1)  Open your Spotify App and play a song
You already did that, so you’re ahead of the game.


## 2) Register your App
Visit Spotify’s Developer Site, go to ‘My Apps’, click ‘create an app’. Name and describe the app whatever you want.


On the following screen is where we’ll find your new app’s details.


Add a redirect URI. This is the link that Spotify will need in order to safely send the user back to your app after they’ve been authorised. Type in http://localhost:8888/callback. Click the ‘save changes’ button at the bottom.

Copy down the Client ID, the Client Secret, and your redirect URI. You’ll need these into your server code for it to work. The ones in the screenshot below won’t work for you, as I re-generated them after writing this tutorial.

## 3) Set up the Server
Create a folder called spotify-api-intro and navigate to it.

We’ll use and modify an example provided by Spotify. While you’re on Spotify’s Developer Site, click on Web-api -> Code Examples and Libraries -> Example App Code, you should find this repository. Clone it and install the dependencies

git clone https://github.com/spotify/web-api-auth-examples.git auth-server
cd auth-server
npm install
You’ll notice it’s separated into three directories, one for each authorisation flow. Since we’ll be using authorisation_code, navigate to that one and open app.js in your favourite code editor. Right below the imports, there are three variables we need to set, client_id, client_secret, and redirect_uri. Paste the text that you copied earlier.
```
/* auth-server/authorization_code/app.js */
var client_id = ‘CLIENT_ID’; // Your client id
var client_secret = ‘CLIENT_SECRET’; // Your secret
var redirect_uri = ‘REDIRECT_URI’; // Your redirect uri
Start it up by running `node authorization_code/app.js`. Open up your browser and you should see a log in button.
```

When you click it, it should take you to Spotify’s Login page. Once you’re logged in, it will send you back to your redirect URI. You should then see your Spotify account information, as well as your access token and refresh token.


If you want to understand in more detail what’s going on, run the process, again, this time paying close attention to the address bar. Notice the variables being passed into the query string at each step. Then, look through the example server code (app.js) and compare it to the authorization flow diagram, identifying which parts of the code correspond to which parts of the authorization flow. Don’t worry about ‘scope’ yet, we’ll talk about that one in the next step.


## 4) Set up the Client

In the example we just used, the access token is passed into the query string so that the front-end can access it. We’re going to use the same method use the token in our React app and make API requests there.

Go back to the project’s root, then use create-react-app to make a new application in a separate directory. Then, run ‘npm start’ and visit localhost:3000 to check that the app is working. Make sure that your other server is still running and listening on port 8888, as we’ll need it too.
```
cd ..
create-react-app client
cd client
npm install
npm start
```
Remove the content in the client/src/App.js component. Replace with a link to ‘http://localhost:8888’.
```
/* client/src/App.js */
render() {
  return (
    <div className='App'>
      <a href='http://localhost:8888'> Login to Spotify </a>
    </div>
  )
}
```
You can add a css rule in src/App.css to add some margins
```
/* client/src/App.css */
div, button {
  margin: 10px;
}
```
Check to make sure clicking this button takes you to the login page we used before, but don’t actually log in just yet.

When authorised, we need to be sent back to our client app, so we need make a couple changes in the server’s app.js file.

In auth-server/authorisation_code/app.js, find the first ‘res.redirect(‘/#’’ near the bottom of the file and change ‘/#’ to ‘http://localhost:3000/#'.
```
/* auth-server/authorization_code/app.js */
res.redirect(‘http://localhost:3000/#' +
  querystring.stringify({
    access_token: access_token,
    refresh_token: refresh_token
}));
```
There’s one last thing we need to change in the server code. There’s a variable called scope which has a string of words like ‘user-read-email’. These represent each of the actions that your app is requesting to be allowed to do with your Spotify account. You can read all about Spotify’s scopes here. The one we need, ‘user-read-playback-state’, is not in there so let’s add it in.
```
/* auth-server/authorization_code/app.js */
var scope = ‘user-read-private user-read-email user-read-playback-state’;
```
Make sure to restart the server to make sure your changes go into effect.

Let’s see if it all works, click the login button on your react app. It should take you to the Spotify Login page, and when you’ve logged in, you should be redirected back to your react app, and the access_token should be in the in the query string, along with other data.


## 5) Make your first API Call

We’re almost there. Now we just need to pull the token from the query sting into our react app and we can use it. There are many ways to do this, but I’m lazy so I copied the function getHashParams from the example code that we cloned (found in auth-server/authorization_code/public/index.html), and made a slight change just to silence create-react-app’s picky linter. The function returns an object with the parameters as properties.

Create a constructor, and in it save the return value of this function into a variable called params. You can throw in a console log for now to make sure it’s working.

```
/* client/src/App.js */
class App extends Component {
  constructor(){
    super();
    const params = this.getHashParams();
    console.log(params);
  }
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }
  render() {
    return (
      <div className="App">
        <a href='http://localhost:8888' > Login to Spotify </a>
      </div>
    );
  }
}
```
Now that we have access to the token, it’s finally time to use the API. Instead of manually coding our API requests, we’re going to use a library, which was created by José M. Pérez, a Spotify engineer, that abstracts pretty much every API call we could need.

Let’s Install it in the client directory

npm install --save spotify-web-api-js
The library is a class, so import it to your App.js file and instantiate it as a new variable called spotifyApi

/* client/src/App.js */
import SpotifyWebApi from ‘spotify-web-api-js’;
const spotifyApi = new SpotifyWebApi();
The library’s repository has a README that highlights basic use of the library, but even though there doesn’t seem to be further documentation (the link to it is broken), the source file itself is very well organised and commented, so you can easily find the methods you need, as well as how to call them.

The first thing we need to do is store our access token into the object. Let’s do that in the constructor, adding an if-statement to make sure that we only do so if there is an access token in the query string, and not when we first open the app. While we’re in the constructor, let’s prepare for the data we’ll receive by setting state with the key nowPlaying set to ’Not Checked’ for now. In this initial state object, we can add property to our state object called loggedIn, which will help us conditionally render jsx.
```
/* client/src/App.js */
constructor(){
  super();
  const params = this.getHashParams();
  const token = params.access_token;
  if (token) {
    spotifyApi.setAccessToken(token);
  }
  this.state = {
    loggedIn: token ? true : false,
    nowPlaying: { name: 'Not Checked', albumArt: '' }
  }
}
```
We should also make some room for the variable in the JSX template. Check your browser to make sure everything’s there.
```
/* client/src/App.js */
render() {
  return (
    <div className="App">
      <a href='http://localhost:8888' > Login to Spotify </a>
      <div>
        Now Playing: { this.state.nowPlaying.name }
      </div>
      <div>
        <img src={this.state.nowPlaying.albumArt} style={{ height: 150 }}/>
      </div>
    </div>
  );
}
```

It’s finally time to make our API call. Write a function called getNowPlaying inside of the App Class to make the API request. This function will use the one of the many spotifyApi methods to make a request and creates a promise. We then use the response data to set state. The code below is already structured access the right data in the response, but I highly suggest you experiment by looking at the entire response object, either by logging it to the console or by checking the network tab in your dev tools, so that you can be more familiar with it, because there is a lot of other potentially useful data in there.
```
/* client/src/App.js */
getNowPlaying(){
  spotifyApi.getMyCurrentPlaybackState()
    .then((response) => {
      this.setState({
        nowPlaying: { 
            name: response.item.name, 
            albumArt: response.item.album.images[0].url
          }
      });
    })
}
```
The last thing you’ll need to do is set up some divs to show our data, and a button to trigger geNowplaying. The binary operator is to make sure it only gets rendered if you’re logged in.
```
/* client/src/App.js */
render() {
  return (
    <div className="App">
      <a href='http://localhost:8888' > Login to Spotify </a>
      <div>
        Now Playing: { this.state.nowPlaying.name }
      </div>
      <div>
        <img src={this.state.nowPlaying.albumArt} style={{ height: 150 }}/>
      </div>
      { this.state.loggedIn &&
        <button onClick={() => this.getNowPlaying()}>
          Check Now Playing
        </button>
      }
    </div>
  );
}
```
All done! All that’s left to do is try it out. Click the button and your currently playing song’s name and album art should appear.


Next Steps
