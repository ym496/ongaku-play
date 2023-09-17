from flask import Flask, request, render_template, redirect, url_for, jsonify
from flask import current_app as app
from application.models import Queue, db
from pytube import YouTube, Search, Playlist
import os

def parse(input_text):
    text_sp = input_text[1:].split()
    command = text_sp[0]
    Fargs = text_sp[1:]
    options = []
    args =[]
    for i in Fargs:
        if i.startswith('-') or i.startswith('--'):
            options.append(i)
        else:
            args.append(i)

    return command, args,options

def execute(command,args,options):
    if command == 'play'and len(args)>0:
        link = args[0]
        yt = YouTube(link)
        audio = yt.streams.filter(only_audio=True).first()
        song_name = yt.title.replace(" ",'_')
        audio.download(filename=f'./static/songs/{song_name}.mp3')
        track = Queue(song_name=yt.title,song_path=f'songs/{song_name}.mp3')
        db.session.add(track)
        db.session.commit()
        latest_track = Queue.query.filter_by(id=track.id).first()
        response = {'type': 'play','song':latest_track}
        return response
    elif command == 'playlist' and len(args)>0:
        link = args[0].strip()
        p = Playlist(link)
        db.session.query(Queue).delete()
        db.session.commit()
        directory_path = './static/songs/'
        for filename in os.listdir(directory_path):
            file_path = os.path.join(directory_path, filename)
            os.remove(file_path)
        for song in p:
            yt = YouTube(song)
            audio = yt.streams.filter(only_audio=True).first()
            song_name = yt.title.replace(" ",'_')
            audio.download(filename=f'./static/songs/{song_name}.mp3')
            track = Queue(song_name=yt.title,song_path=f'songs/{song_name}.mp3')
            db.session.add(track)
            db.session.commit()
        return {'type': 'playlist'}
    elif command == 'clear':
        db.session.query(Queue).delete()
        db.session.commit()
        directory_path = './static/songs/'
        for filename in os.listdir(directory_path):
            file_path = os.path.join(directory_path, filename)
            os.remove(file_path)
        return {'type': 'clear'}
    else:
        return {'type': 'error'}


def ytSearch(query):
    s = Search(query)
    results = []
    for i in s.results[0:10]:
        results.append({
            'title': i.title,
            'url': i.watch_url,
            'thumbnail': i.thumbnail_url
            })
    return results

@app.route('/',methods=["GET","POST"])
def index():
    
    if request.method == "GET":
        return render_template('index.html')
    if request.method == "POST":
        text = request.json.get('query')
        command,args,options = parse(text)
        output = execute(command,args,options)
        if output['type'] == 'play':
            response_data = {'status': 'success','type':'play','id': output['song'].id,'name': output['song'].song_name,'path': output['song'].song_path}
            return jsonify(response_data)
        elif output['type'] == 'playlist':
            return jsonify({'status': 'success'})
        elif output['type'] == 'clear':
            return jsonify({'status': 'success'})
        else:
            return jsonify({'status': 'error'})

@app.route('/get_results', methods=['GET'])
def get_results():
    query = request.args.get('query')
    results = ytSearch(query)
    return jsonify(results)

@app.route('/get_queue', methods=['GET'])
def get_queue():
    queue = db.session.query(Queue).all()
    queue_data = []
    for song in queue:
        data = {'name': song.song_name,'id': song.id,'path': song.song_path}
        queue_data.append(data)

    return jsonify(queue_data)

@app.route('/get_song/<int:song_id>', methods=['GET'])
def get_song(song_id):
    song = db.session.query(Queue).filter_by(id=song_id).first()
    song_data = {
        'title': song.song_name,
        'url': song.song_path,
    }
    
    return jsonify(song_data)

