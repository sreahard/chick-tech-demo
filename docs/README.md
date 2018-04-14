## Preface — Understand The Process

Before we gert started let's make sure everyone's environment is setup properly. 

In your terminal check and see if you already have node installed by typing `node -v`
If your computer returns a version number you are all set, if not you can download the install package here: [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

You will also need a Spotify Account, a free account will work.

Before we do anything, let’s step back and get an overview of the process we’ll be going through. Spotify’s API has great documentation, and in there they describe the 3 types of authorization flows you can go through to use their API. The one we’ll be using today is the authorization code flow. Here is a more detailed rundown of the types of authorization Spotify offers. 
[https://beta.developer.spotify.com/documentation/general/guides/authorization-guide/](https://beta.developer.spotify.com/documentation/general/guides/authorization-guide/)

If you’ve ever used and app that asked you to log in with Facebook, Google etc., then you’ve used Oauth. It basically allows your app to get authorized by Spotify and return to your app’s redirect URI with an access code, which will allow your app to access that users’ Spotify information.

You will then go to Spotify and exchange that authorization code for an access_token, which be used to make API calls.

Note: The token will expire after 60 minutes. If things stop working as you expect you can log in again by going to [http://localhost:8888/login](http://localhost:8888/login)

## 1) Register your App
Visit Spotify’s Developer Site, go to ‘My Apps’, click ‘create an app’. Name and describe the app whatever you want.
[https://beta.developer.spotify.com/dashboard/applications](https://beta.developer.spotify.com/dashboard/applications)

On the following screen is where we’ll find your new app’s details.

Add a redirect URI. This is the link that Spotify will need in order to safely send the user back to your app after they’ve been authorized. Type in http://localhost:8888/callback. Click the ‘save changes’ button at the bottom.

Copy down the Client ID, the Client Secret, and your redirect URI. You’ll need these into your server code for it to work.

## 2) Set up the Server
Create a folder called `chick-tech-spotify-demo` and navigate to it.

We’ll use and modify an example provided by Spotify. You can download it here: [https://github.com/spotify/web-api-auth-examples](https://github.com/spotify/web-api-auth-examples)

Once you have the .zip file downloaded to your `chick-tech-spotify-demo` folder, extract it and rename the folder `server`

Most time when you download a code example from github you will need to install the packages provided to make things work properly, we can do that in the terminal from our server folder with the following command.

```
cd npm install
```

You’ll notice the example is separated into three directories, one for each authorization flow. Since we’ll be using authorization_code, navigate to that folder and open app.js in your code editor. Right below the imports, there are three variables we need to set, client_id, client_secret, and redirect_uri. We will get those from the info we copied down earlier from the Spotify web site.
```
/* auth-server/authorization_code/app.js */
var client_id = 'CLIENT_ID'; // Your client id
var client_secret = 'CLIENT_SECRET'; // Your secret
var redirect_uri = 'REDIRECT_URI'; // Your redirect uri
```
We are going to now install a tool called nodemon that will keep our node server running and updating everytime we make changes to our app.js file.
In your terminal run this command 
`npm install -g nodemon`

Now we can start our server with this command `nodemon authorization_code/app.js`. 
Open up your browser and when you go to [http://localhost:8888/](http://localhost:8888/) you should see a log in button.

When you click it, it should take you to Spotify’s Login page. Once you’re logged in, it will send you back to your redirect URI. You should then see your Spotify account information, as well as your access token and refresh token. You will notice the url will change and have parameters in it that have been passed from the api request.


## 3) Set up the Client

In the example we just used, the access token is passed into the query string so that the front-end can access it. We’re going to use the same method use the token in our React app and make API requests there.

Go back to the project’s root in your terminal, then use create-react-app to make a new application in the root directory of our app `chick-tech-spotify-demo` follow the steps below to get the app up and running.
```
cd ..
npx create-react-app client
cd client
npm install
npm start
```
Remove the contents in the render area of the client/src/App.js component and replace it with a link to 'http://localhost:8888’. It should look like the code below.
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
.App a {
  margin: 10px;
}
```
Check to make sure clicking this link takes you to the login page we used before, but don’t actually log in just yet.

When authorized, we need to be sent back to our newly created React app, so we need make a couple changes in the server’s app.js file.

In auth-server/authorization_code/app.js, find the first ‘res.redirect(‘/#’’ near the bottom of the file (line 105) and change ‘/#’ to ‘http://localhost:3000/#'.
```
/* auth-server/authorization_code/app.js */
res.redirect('http://localhost:3000/#' +
  querystring.stringify({
    access_token: access_token,
    refresh_token: refresh_token
}));
```
There’s one last thing we need to change in the server code. There’s a variable called scope which has a string of words like ‘user-read-email’. These represent each of the actions that your app is requesting to be allowed to do with your Spotify account. There are a few diferent scopes we will be using today so let's go ahead and add them all right now.
```
/* auth-server/authorization_code/app.js */
var scope = ['user-read-private, user-read-email, streaming, user-read-currently-playing, user-modify-playback-state, user-read-playback-state'];
```

Let’s see if it all works, click the login button on your React app. It should take you to the Spotify Login page, and when you’ve logged in, you should be redirected back to your react app, and the access_token should be in the in the query string, along with other data.


## 4)  Open your Spotify App or the Spotify Web App and play a song

Great, now lets mute those players so we don't all go crazy while working on this.


## 5) Make your first API Call

We’re almost there. Now we just need to pull the token from the query sting into our React app so we can use it. For this we are going to use the query-string package from npm so let's install it.

From the terminal, make sure you are in the folder `chick-tech-spotify-demo/client` to install the package use the command `npm install --save query-string`

Now we will have access to the query string tools it provides so we can get the access token from the url. 

In order to use packages in React you need to import them at the top of your doccument, so in App.js let's add this line on the 2nd line of the file.

`import querystring from "query-string";`


Next we need to create a constructor that will help bind all of the actions we will be creating to our application, and in it let's get the token from the query string. For now let's just log the results so we can make sure it is working the way we want.

```
/* client/src/App.js */
class App extends Component {
  constructor(){
    super();
    const params = querystring.parse(window.location.hash);
    console.log(params);
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
Now we you go to your browser, if you look in the console, you should see the parameters we are logging.

Now that we have access to the token, it’s finally time to use the API. Instead of manually coding our API requests, we’re going to use a library, which was created by José M. Pérez, a Spotify engineer, that abstracts pretty much every API call we could need.

Let’s install it in the client directory just like we did with query-string

`npm install --save spotify-web-api-js`

The library is a class, so we will need to import it to our App.js file and instantiate it as a new variable called spotifyApi
```
/* client/src/App.js */
import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();
```
The library’s repository has a README that highlights basic use of the library and good documentaion on how to use it. [https://doxdox.org/jmperez/spotify-web-api-js](https://doxdox.org/jmperez/spotify-web-api-js)

Once we have that tool set up, we need to store our access token into the object. Let’s do that in the constructor, adding an if-statement to make sure that we only do so if there is an access token in the query string, and not when we first open the app. While we’re in the constructor, let’s prepare for the data we’ll receive by setting state with the key nowPlaying set to 'Not Checked' for now. In this initial state object, we can add a property to our state object called loggedIn, which will help us conditionally render jsx.
```
/* client/src/App.js */
constructor(){
  super();
  const params = querystring.parse(window.location.hash);
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

It’s finally time to make our API call. Lets' write a function called getNowPlaying inside of the App Class to make the API request. This function will use the one of the many spotifyApi methods to make a request and creates a promise. We then use the response data to set state. We also want to add a catch if for some reason the API throws an error, we want to set the loggedIn state to false so we can relogin and try again. The code below is already structured access the right data in the response, but let's experiment by looking at the entire response object, by logging it to the console so we can see what we are working with. This data structure is also documented in the Spotify docs, but I find this way to be a much simpler way to see what data we have to work with.
```
/* client/src/App.js */
getNowPlaying(){
  spotifyApi.getMyCurrentPlaybackState()
    .then(response => {
      console.log(response)
      this.setState({
        nowPlaying: { 
            name: response.item.name, 
            albumArt: response.item.album.images[0].url
          }
      });
    }).catch(e => this.setState({
          loggedIn: false,
      }));
}
```
The last thing you’ll need to do is set up some divs to show our data, and a button to trigger geNowplaying. The binary operator is to make sure it only gets rendered if you’re logged in. And to only show the login link if you are logged out. I like to destructure my objects at the top of my functions, I think it makes the code easier to read and I don't have to type as much :)
```
/* client/src/App.js */
render() {
  const { loggedIn, nowPlaying } = this.state 
  return (
    <div className="App">
      {!loggedIn && <a href='http://localhost:8888' > Login to Spotify </a>}
      <div>
        Now Playing: {nowPlaying.name}
      </div>
      <div>
        <img src={nowPlaying.albumArt} style={{ height: 150 }}/>
      </div>
      {loggedIn &&
        <button onClick={() => this.getNowPlaying()}>
          Check Now Playing
        </button>
      }
    </div>
  );
}
```
All done! All that’s left to do is try it out. Click the button and your currently playing song’s name and album art should appear.


## Next Steps: 

Using spotify-web-api-js we will implement the ability to play and pause music, skip tracks and search for artists. Once everything is working we can make it look good! Strech goal, add the ability to not play artists you don't like.
