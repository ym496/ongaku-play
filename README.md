# ongaku-play
A web-based music player that streams songs and playlists from YouTube, ad-free.
# demo
![Demo GIF](https://i.imgur.com/WYbitD5.gif)
# Commands
There are also some text based commands that can be executed using the prefix `.`
* `.play <song-link>` => To add a song to the queue using a Youtube link.
* `.playlist <playlist-link>` => To rewrite the queue and populate it with songs from a Youtube playlist.
* `.clear` => To remove every song from the queue and make it empty.
# Running
* Make sure to get Python 3.10.12 or higher.
* Clone this repo.
```
git clone git@github.com:ym496/ongaku-play.git
```
* Create a virtual environment.
```
python3 -m venv venv
```
* Activate the virtual environment.
```
source venv/bin/activate
```
* Install the dependencies.
```
pip install -r requirements.txt
```
* Run.
```
python main.py
```
