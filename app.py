from flask import Flask, render_template, request, send_file, json
from pytubefix import YouTube
from moviepy.video.io.VideoFileClip import VideoFileClip
from moviepy.audio.io.AudioFileClip import AudioFileClip
from io import BytesIO
import os

from video_editing.clip import clip_video, clip_audio, merge_audio_video
from lib import filter_streams, get_stream

os.system("cls")

app = Flask(__name__)

@app.route('/')
def home():
  return render_template("index.html")

@app.route('/info')
def info():
  # Get the URL of the YouTube video
  url = request.args.get('url')
  
  yt = YouTube(url)

  title = yt.title
  thumbnail_url = yt.thumbnail_url
  length = yt.length
  formats = filter_streams(yt.streams.filter(type="video", mime_type="video/mp4"))

  # Send json object contains video data to the browser
  return { "title": title, "thumbnail_url": thumbnail_url, "length": length,"formats": formats }

@app.route('/download')
def download():
  # Get the URL of the YouTube video
  url = request.args.get('url')
  itag = request.args.get('itag')
  start = int(request.args.get('start') or 0)
  end = int(request.args.get('end') or yt.length)
  
  yt = YouTube(url)
  
  video = yt.streams.get_by_itag(itag)
  file_stream = get_stream(video)

  if video.is_progressive and start == 0 and (end is None or end == yt.length):
    return send_file(file_stream, as_attachment=True, download_name=f'{yt.title}.{video.mime_type.split('/').pop()}')

  video_cliped = clip_video(file_stream.read(), start, end)

  if not video.is_progressive:
    audio_stream = get_stream(yt.streams.get_audio_only())
    audio_cliped = clip_audio(audio_stream.read(), start, end)

  result = merge_audio_video(
    audio_cliped,
    video_cliped,
  ) if not video.is_progressive else video_cliped

  return send_file(result, as_attachment=True, download_name=f'{yt.title}.{video.mime_type.split('/').pop()}')

@app.route('/error')
def error():
    return render_template('error.html', message='Please fill in all fields!')

if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0")