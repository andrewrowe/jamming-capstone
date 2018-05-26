const clientID = '7e8db2b0b371419a8861a6102f76b158';
const redirectUri = 'https://jammingandrew.surge.sh';
let accessToken;
let expiresIn;

const Spotify = {
    getAccessToken() {
        const url = window.location.href;
        const token = url.match(/access_token=([^&]*)/);
        const time = url.match(/expires_in=([^&]*)/);

        //If this isn't set to the initial value, then it's already been set and we can simply return it
        if (accessToken) {
            return accessToken;
        }
        //Next we check to see if it has just been returned in the URL, and if so update our values
        else if (token !== null && time !== null) {
            accessToken = token[1];
            expiresIn = time[1];
        }
        //If neither of the above conditions are true we must obtain a new access code
        else {
            window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&redirect_uri=${redirectUri}&scope=playlist-modify-public`;
            accessToken = token[1];
            expiresIn = time[1];
        }

        //Wipes access token and URL parameters so the app doesn't try grabbing the access token after it's expired
        window.setTimeout(() => accessToken = null, expiresIn * 1000);
        window.history.pushState('Access Token', null, '/');
        return accessToken;
    },

    search(term) {
        this.getAccessToken()
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,
            {headers: 
                {Authorization: `Bearer ${accessToken}`}
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Request Failed!');
        }, networkError => console.log(networkError.message)
        ).then(jsonResponse => {
            if (jsonResponse.tracks.items) {
                return jsonResponse.tracks.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    artist: item.artists[0].name,
                    album: item.album.name,
                    uri: item.uri
                }))
            } else {
                return [];
            }
        })
    },

    savePlaylist(playlistName, trackUris) {
        this.getAccessToken();
        let userID;
        let playlistID;

        if (playlistName && trackUris) {
            //Retreive a user's ID from the Spotify API
            return fetch(`https://api.spotify.com/v1/me`, {
                headers: {Authorization: `Bearer ${accessToken}`}
            }).then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Request Failed!');
            }, networkError => console.log(networkError.message)
            ).then(jsonResponse => {
                userID =jsonResponse.id;

            //Add tracks to newly created playlist
            return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
                headers: {'Content-type': `application/json`,
                Authorization: `Bearer ${accessToken}`},
                method: 'POST',
                body: JSON.stringify({name: playlistName})
            }).then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Request Failed!');
            }, networkError => console.log(networkError.message)
            ).then(jsonResponse => {
                playlistID = jsonResponse.id;

            //Create a new playlist on the user's Spotify account and save the playlist's ID
            return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
                headers: {Authorization: `Bearer ${accessToken}`,
                'Content-type': 'application/josn'},
                method: 'POST',
                body: JSON.stringify({uris: trackUris})
            }).then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Request Failed!');
            }, networkError => console.log(networkError.message)
            ).then(jsonResponse => {
                console.log(jsonResponse.snapshot_id);
            });
            });
        });
    }
}
}

export default Spotify;