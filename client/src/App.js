import React, { Component } from "react";
import querystring from "query-string";
import SpotifyWebApi from "spotify-web-api-js";
import "./App.css";

const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor(props) {
    super(props);
    this.params = querystring.parse(window.location.hash);
    const token = this.params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      nowPlaying: { name: "Not Checked", albumArt: "" },
      isPlaying: false,
      deviceId: null,
      updatePlayer: false,
      searchValue: "",
      searchResults: { albums: [], artists: [], playlists: [], tracks: [] },
      fetchingSearchResults: false,
      loadError: false,
    };
    this.getNowPlaying = this.getNowPlaying.bind(this);
    this.skipTrack = this.skipTrack.bind(this);
    this.playPause = this.playPause.bind(this);
    this.playArtist = this.playArtist.bind(this);
    this.searchSpotify = this.searchSpotify.bind(this);
  }

  componentWillMount() {
    if (this.state.loggedIn) {
      this.getNowPlaying();
    }
  }

  getNowPlaying() {
    spotifyApi.getMyCurrentPlaybackState().then(response => {
      if (response) {
        const { item, device, is_playing } = response;
        this.setState({
          nowPlaying: {
            name: item.name,
            albumArt: item.album.images[0].url,
          },
          isPlaying: is_playing,
          deviceId: device.id,
        });
      } else {
        this.setState({
          loadError: true,
        });
      }
    });
  }

  playPause() {
    const { isPlaying, deviceId } = this.state;
    if (isPlaying) {
      spotifyApi.pause({ device_id: deviceId });
    } else {
      spotifyApi.play({ device_id: deviceId })
    }
    this.setState({
      isPlaying: !isPlaying,
    });
  }

  playArtist(id) {
    const badArtists = ['3WrFJ7ztbogyGnTHbHJFl2', '6deZN1bslXzeGvOLaLMOIF', '2TI7qyDE0QfyOlnbtfDo7L', '13vQloYd6mP7V1mVwKJwS2', '33URbzNgBt1Moj2TpnMtdn']
    if (badArtists.includes(id)) {
      spotifyApi.play({ device_id: this.state.deviceId, context_uri: 'spotify:artist:0J7U24vlOOIeMpuaO6Q85A' }).then(() => {
        setTimeout(() => this.getNowPlaying(), 500);
      });
    } else {
      spotifyApi.play({ device_id: this.state.deviceId, context_uri: `spotify:artist:${id}` }).then(() => {
        setTimeout(() => this.getNowPlaying(), 500);
      });
    }
  }

  searchSpotify(event) {
    event.preventDefault();
    this.setState({
      fetchingSearchResults: true,
    });
    spotifyApi.search(this.state.searchValue, ["artist"]).then(response => {
      this.setState({
        searchResults: {
          artists: response.artists.items,
        },
        fetchingSearchResults: false,
      });
    });
  }

  skipTrack(direction) {
    const { deviceId } = this.state;
    if (direction === "next") {
      spotifyApi.skipToNext({ device_id: deviceId }).then(() => {
        setTimeout(() => this.getNowPlaying(), 500);
      });
    } else {
      spotifyApi.skipToPrevious({ device_id: deviceId }).then(() => {
        setTimeout(() => this.getNowPlaying(), 500);
      });
    }
  }

  render() {
    return (
      <div className="App">
        {!this.state.loggedIn || this.state.loadError ? (
          <a href="http://localhost:8888"> Login to Spotify </a>
        ) : (
          <div>
            <div>Now Playing: {this.state.nowPlaying.name}</div>
            <div>
              <img
                alt={this.state.nowPlaying.name}
                src={this.state.nowPlaying.albumArt}
                style={{ height: 150 }}
              />
            </div>
            <button onClick={() => this.skipTrack("previous")}>Previous</button>
            <button onClick={this.playPause}>
              {this.state.isPlaying ? "Pause" : "Play"}
            </button>
            <button onClick={() => this.skipTrack("next")}>Next</button>
            <div>
              <input
                value={this.state.searchValue}
                onChange={event =>
                  this.setState({
                    searchValue: event.target.value,
                  })
                }
              />
              <button
                onClick={this.searchSpotify}
                disabled={this.state.fetchingSearchResults}
              >
                Find Artist
              </button>
            </div>
            {this.state.searchResults.artists.length > 0 && (
              <div>
                <h2>Resluts</h2>
                <h3> Artists </h3>
                {this.state.searchResults.artists.map(artist => (
                  <div key={artist.id}>
                    <img
                      src={
                        artist.images.length > 0
                          ? artist.images[0].url
                          : "http://via.placeholder.com/75x75"
                      }
                      alt={artist.name}
                      width="75"
                      height="75"
                    />
                    {artist.id}
                    <button onClick={() => this.playArtist(artist.id)}>Play {artist.name}</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default App;
