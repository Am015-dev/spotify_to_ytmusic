import unittest
from unittest.mock import patch, MagicMock
import sys

import spotify2ytmusic.cli as cli


class TestCLI(unittest.TestCase):
    @patch("spotify2ytmusic.backend.copy_playlist")
    def test_copy_playlist_command(self, mock_copy_playlist):
        # Provide fake command line arguments
        test_args = [
            "prog",
            "--track-sleep",
            "0",
            "--dry-run",
            "source_id",
            "+dest_name",
        ]
        with patch.object(sys, "argv", test_args):
            cli.copy_playlist()

        mock_copy_playlist.assert_called_once_with(
            spotify_playlist_id="source_id",
            ytmusic_playlist_id="+dest_name",
            track_sleep=0.0,
            dry_run=True,
            spotify_playlists_encoding="utf-8",
            reverse_playlist=True,
            privacy_status="PRIVATE",
        )

    @patch("spotify2ytmusic.backend.copy_all_playlists")
    def test_copy_all_playlists_command(self, mock_copy_all):
        test_args = [
            "prog",
            "--track-sleep",
            "0",
            "--dry-run",
        ]
        with patch.object(sys, "argv", test_args):
            cli.copy_all_playlists()

        mock_copy_all.assert_called_once_with(
            track_sleep=0.0,
            dry_run=True,
            spotify_playlists_encoding="utf-8",
            reverse_playlist=True,
            privacy_status="PRIVATE",
        )


if __name__ == "__main__":
    unittest.main()
