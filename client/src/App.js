import React, { Component } from "react";
import querystring from "query-string";
import SpotifyWebApi from "spotify-web-api-js";
import {
  FaPlay,
  FaPause,
  FaBackward,
  FaForward,
  FaSearch,
  FaCircle,
} from "react-icons/lib/fa";
import logo from "./logo.svg";
import "./App.css";

const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor() {
    super();
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
      updatePlayerMs: null,
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
    spotifyApi
      .getMyCurrentPlaybackState()
      .then(response => {
        if (response) {
          const { item, device, is_playing, progress_ms } = response;
          this.setState({
            nowPlaying: {
              name: item.name,
              artist: item.artists[0].name,
              albumArt: item.album.images[0].url,
            },
            isPlaying: is_playing,
            deviceId: device.id,
            updatePlayerMs: (item.duration_ms - progress_ms) + 100
          });
        } else {
          this.setState({
            loggedIn: false,
          });
        }
      })
      .catch(e =>
        this.setState({
          loggedIn: false,
        })
      );
  }

  playPause() {
    const { isPlaying, deviceId } = this.state;
    if (isPlaying) {
      spotifyApi.pause({ device_id: deviceId }).catch(e => {
        this.setState({
          loggedIn: false,
        });
      });
    } else {
      spotifyApi.play({ device_id: deviceId }).catch(e => {
        this.setState({
          loggedIn: false,
        });
      });
    }
    this.setState({
      isPlaying: !isPlaying,
    });
  }

  playArtist(id) {
    const badArtists = [
      "3WrFJ7ztbogyGnTHbHJFl2", // Beetles
      "6deZN1bslXzeGvOLaLMOIF", // Nickelback
      "2TI7qyDE0QfyOlnbtfDo7L", // Dave Matthews Band
      "13vQloYd6mP7V1mVwKJwS2", // Dave Matthews
      "33URbzNgBt1Moj2TpnMtdn", // Dave Matthews
      "4xtWjIlVuZwTCeqVAsgEXy", // Insane Clown Posse
    ];
    const favoriteArtists = [
      "0fA0VVWsXO9YnASrzqfmYu", // Khalid
      "2YZyLoL8N0Wb9xBt1NhZWg", // Kendrick Lamar
      "1Xyo4u8uXC1ZmMpatF05PJ", // The Weeknd
      "56oDRnqbIiwx4mymNEv7dS", // Lizzo
    ];
    if (badArtists.includes(id)) {
      spotifyApi
        .play({
          device_id: this.state.deviceId,
          context_uri: `spotify:artist:${
            favoriteArtists[
              Math.floor(Math.random() * favoriteArtists.length + 1)
            ]
          }`,
        })
        .then(() => {
          setTimeout(() => this.getNowPlaying(), 500);
        })
        .catch(e => {
          this.setState({
            loggedIn: false,
          });
        });
    } else {
      spotifyApi
        .play({
          device_id: this.state.deviceId,
          context_uri: `spotify:artist:${id}`,
        })
        .then(() => {
          setTimeout(() => this.getNowPlaying(), 500);
        })
        .catch(e => {
          this.setState({
            loggedIn: false,
          });
        });
    }
  }

  searchSpotify(event) {
    event.preventDefault();
    this.setState({
      fetchingSearchResults: true,
    });
    spotifyApi
      .search(this.state.searchValue, ["artist"])
      .then(response => {
        this.setState({
          searchResults: {
            artists: response.artists.items,
          },
          fetchingSearchResults: false,
        });
      })
      .catch(e => {
        this.setState({
          loggedIn: false,
        });
      });
  }

  skipTrack(direction) {
    const { deviceId } = this.state;
    if (direction === "next") {
      spotifyApi
        .skipToNext({ device_id: deviceId })
        .then(() => {
          setTimeout(() => this.getNowPlaying(), 500);
        })
        .catch(e => {
          this.setState({
            loggedIn: false,
          });
        });
    } else {
      spotifyApi
        .skipToPrevious({ device_id: deviceId })
        .then(() => {
          setTimeout(() => this.getNowPlaying(), 500);
        })
        .catch(e => {
          this.setState({
            loggedIn: false,
          });
        });
    }
  }

  render() {
    const {
      isPlaying,
      searchValue,
      fetchingSearchResults,
      searchResults,
      loggedIn,
      nowPlaying,
      updatePlayerMs,
    } = this.state;
    const icon = isPlaying ? "pause" : "play";
    return (
      <div className="App">
        {!loggedIn ? (
          <a href="http://localhost:8888" className="loginButton">
            Login to Spotify
          </a>
        ) : (
          <div>
            {isPlaying && setTimeout(() => this.getNowPlaying(), updatePlayerMs)}
            <div>
              <img
                alt={nowPlaying.name}
                src={nowPlaying.albumArt}
                style={{ height: 350 }}
              />
            </div>
            <div className="trackInfo">
              <strong>{nowPlaying.artist}</strong> {nowPlaying.name}
            </div>
            <button
              className="controlButton"
              onClick={() => this.skipTrack("previous")}
            >
              <FaBackward />
              <span className="srOnly">Previous Track</span>
            </button>
            <button className="controlButton" onClick={this.playPause}>
              {isPlaying ? <FaPause /> : <FaPlay />}
              {isPlaying ? (
                <span className="srOnly">Pause</span>
              ) : (
                <span className="srOnly">Play</span>
              )}
            </button>
            <button
              className="controlButton"
              onClick={() => this.skipTrack("next")}
            >
              <FaForward />
              <span className="srOnly">Next Track</span>
            </button>
            <div>
              <form className="searchForm" onSubmit={this.searchSpotify}>
                <button
                  className="searchButton"
                  onClick={this.searchSpotify}
                  disabled={fetchingSearchResults}
                >
                  <FaSearch />
                  <span className="srOnly">Find Artist</span>
                </button>
                <input
                  value={searchValue}
                  onChange={event => {
                    this.setState({
                      searchValue: event.target.value,
                    });
                  }}
                />
              </form>
            </div>
            {searchResults.artists.length > 0 && (
              <div>
                <h2> Artists </h2>
                <div className="resultsContainer">
                  {searchResults.artists.map(artist => (
                    <div
                      onClick={() => this.playArtist(artist.id)}
                      className="artistItem"
                      key={artist.id}
                    >
                      <img
                        src={
                          artist.images.length > 0 ? artist.images[0].url : logo
                        }
                        alt={artist.name}
                        className="artistImage"
                        width="75"
                        height="75"
                      />
                      <div className="playButton">
                        <FaPlay />
                      </div>
                      <button>{artist.name}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default App;
