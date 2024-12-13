from flask import Flask, render_template, request, send_file, json
from pytubefix import YouTube
from moviepy.video.io.VideoFileClip import VideoFileClip
from io import BytesIO
import tempfile
import os

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
  print(yt.streams)

  title = yt.title
  thumbnail_url = yt.thumbnail_url
  length = yt.length
  formats = list(map(lambda stream: { "itag": stream.itag, "res": stream.resolution, "type": stream.mime_type.split('/')[0] }, yt.streams.filter(type="video", mime_type="video/mp4")))

  # Send json object contains video data to the browser
  return { "title": title, "thumbnail_url": thumbnail_url, "length": length,"formats": formats }

@app.route('/download')
def download():
  # Get the URL of the YouTube video
  url = request.args.get('url')
  itag = request.args.get('itag')
  start = request.args.get('start') or 0
  end = request.args.get('end')
  
  yt = YouTube(url)
  
  # if format == 'mp4':
    # Download the video
  video = yt.streams.get_by_itag(itag)
  file_stream = BytesIO()
  video.stream_to_buffer(file_stream)
  file_stream.seek(0)

  with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:

    temp_file.write(file_stream.read())
    temp_filename = temp_file.name

  with VideoFileClip(temp_filename) as video_clip:

      trimmed_video = video_clip.subclip(start, end)

      with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as trimmed_video_filename:

        trimmed_video.write_videofile(trimmed_video_filename.name, codec="libx264")

        # Send the file to the browser
        return send_file(trimmed_video_filename.name, as_attachment=True, download_name=f'{yt.title}.{video.mime_type.split('/').pop()}')


@app.route('/error')
def error():
    return render_template('error.html', message='Please fill in all fields!')

if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0")