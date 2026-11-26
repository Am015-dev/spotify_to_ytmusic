#!/usr/bin/env bash
# Example workflow to migrate Spotify playlists to YouTube Music using conda
# This follows the steps outlined in the README.
set -e

# 1. Create and activate a conda environment
conda create --name spotify_to_youtube -y
source "$(conda info --base)/etc/profile.d/conda.sh"
conda activate spotify_to_youtube

# 2. Install required packages
pip install python
pip install spotify2ytmusic

# 3. Prepare working directory
mkdir -p spotify_to_youtube
cd spotify_to_youtube

# 4. Authenticate YTMusic (a browser window will open)
ytmusicapi oauth

# 5. Download spotify-backup script
curl -L -O https://raw.githubusercontent.com/caseychu/spotify-backup/master/spotify-backup.py

# 6. Export liked songs and playlists from Spotify
python spotify-backup.py playlists.json --dump=liked,playlists --format=json

# 7. Import liked songs into YTMusic
s2yt_load_liked
