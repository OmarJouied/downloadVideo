from flask import Flask, render_template, request, send_file
from pytubefix import YouTube

from video_editing.clip import merge_audio_video
from lib import get_stream



import tempfile
import os
from random import randint


TEMP_DIR = tempfile.gettempdir()




app = Flask(__name__)

@app.route('/')
def home():
  return render_template("index.html")

@app.route('/video-info')
def info():
  # Get the URL of the YouTube video
  url = request.args.get('url')
  
  yt = YouTube(url)

  title = yt.title
  thumbnail = yt.vid_info["videoDetails"]["thumbnail"]["thumbnails"][-1]
  length = yt.length
  formats = list(map(lambda format: {"itag": format.itag, "qualityLabel": format.resolution, "isCompleted": format.is_progressive, "type": format.mime_type.split('/').pop() }, filter(lambda stream: stream.resolution, yt.streams)))

  # Send json object contains video data to the browser
  return { "url": url, "title": title, "thumbnail": thumbnail, "length": length, "formats": formats }

@app.route('/download')
def download():
  # Get the URL of the YouTube video
  url = request.args.get('url')
  itag = request.args.get('itag')
  start = int(request.args.get('start') or 0)
  end = int(request.args.get('end') or 0) or None
  
  yt = YouTube(url)
  
  video = yt.streams.get_by_itag(itag)
  file_stream = get_stream(video)
  
  if video.is_progressive and start == 0 and (end is None or end == yt.length):
    return send_file(file_stream, as_attachment=True, download_name=f'{yt.title}.{video.mime_type.split('/').pop()}')

  # video_cliped = clip_video(file_stream.read(), start, end)

  # if not video.is_progressive:
  #   audio_stream = get_stream(yt.streams.get_audio_only())
  #   audio_cliped = clip_audio(audio_stream.read(), start, end)

  rand_num = randint(0, 1000000)
  video_path = os.path.join(TEMP_DIR, f"{rand_num}_video.mp4")
  audio_path = os.path.join(TEMP_DIR, f"{rand_num}_audio.mp3")
  output_path = os.path.join(TEMP_DIR, f"{rand_num}_output.mp4")

  with open(video_path, 'wb') as f:
    f.write(file_stream.read())

  with open(audio_path, 'wb') as f:
    f.write(get_stream(yt.streams.get_audio_only()).read())

  merge_audio_video(
    video_path,
    None if video.is_progressive else audio_path,
    output_path,
    None if start == 0 else start,
    None if end is None or end == yt.length else end,
  )

  response = send_file(output_path, as_attachment=True, download_name=f'{yt.title}.{video.mime_type.split('/').pop()}')

  # Clean up temporary files
  @response.call_on_close
  def cleanup():
    try:
      os.remove(video_path)
      os.remove(audio_path)
      os.remove(output_path)
    except Exception as e:
      print(f"Error removing temporary files: {e}")

  return response

@app.route('/error')
def error():
    return render_template('error.html', message='Please fill in all fields!')

if __name__ == '__main__':
    app.run()