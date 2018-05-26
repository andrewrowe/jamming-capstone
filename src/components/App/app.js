import React, { Component } from 'react';
import './app.css';
import SearchBar from '../SearchBar/searchBar';
import SearchResults from '../SearchResults/searchResults';
import Playlist from '../Playlist/playlist';
import Spotify from '../../util/spotify';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchResults: [],
            playlistName: 'New Playlist',
            playlistTracks: []
        };

        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
        this.updatePlaylistName = this.updatePlaylistName.bind(this);
        this.savePlaylist = this.savePlaylist.bind(this);
        this.searchSpotify = this.searchSpotify.bind(this);
    }

    addTrack(track) {
        if (this.state.playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
            return;
        } else {
            this.setState(prevState => ({
                playlistTracks: [...prevState.playlistTracks, track]
            }))
        }
    }

    removeTrack(track) {
        let removeTrack = this.state.playlistTracks.find(savedTrack => savedTrack.id === track.id);
        if (removeTrack) {
            this.setState(prevState => {
                let newPlaylist = prevState.playlistTracks.slice();
                newPlaylist.splice(removeTrack, 1);
                return {playlistTracks: newPlaylist};
            })
        } else {
            return;
        }
    }

    updatePlaylistName(name) {
        this.setState({playlistName: name});
    }

    savePlaylist() {
        const trackURIs = this.state.playlistTracks.map(track => track.uri);
        Spotify.savePlaylist(this.state.playlistName, trackURIs);
        this.setState({playlistName: 'New Playlist', playlistTracks: []});
    }

    searchSpotify(term) {
        Spotify.search(term).then(items => {
            this.setState({searchResults: items})
        });
    }

    render() {
        return (
        <div>
            <h1>Ja<span className="highlight">mmm</span>ing</h1>
            <div className="App">
                <SearchBar searchSpotify={this.searchSpotify} />
            <div className="App-playlist">
                <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
                <Playlist playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks} onRemove={this.removeTrack}
                    onNameChange={this.updatePlaylistName} onSave={this.savePlaylist} />
            </div>
            </div>
        </div>
        );
    }
}

export default App;