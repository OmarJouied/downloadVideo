from moviepy.video.io.VideoFileClip import VideoFileClip
from moviepy.audio.io.AudioFileClip import AudioFileClip
import tempfile

def clip_video(file_content, start, end):
  with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:

    temp_file.write(file_content)
    temp_filename = temp_file.name

  with VideoFileClip(temp_filename) as video_clip:

      trimmed_video = video_clip.subclip(start, end)

      with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as trimmed_video_filename:

        trimmed_video.write_videofile(trimmed_video_filename.name, codec="libx264")

        # Send the file to the browser
        return trimmed_video_filename.name

def clip_audio(file_content, start, end):
  with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:

    temp_file.write(file_content)
    temp_filename = temp_file.name

  with AudioFileClip(temp_filename) as audio_clip:

      trimmed_audio = audio_clip.subclip(start, end)

      with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as trimmed_audio_filename:

        trimmed_audio.write_audiofile(trimmed_audio_filename.name)

        # Send the file to the browser
        return trimmed_audio_filename.name

def merge_audio_video(audio_file, video_file):
  with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:

    audio = AudioFileClip(audio_file)
    video = VideoFileClip(video_file)

    video = video.set_audio(audio)

    video.write_videofile(temp_file.name, codec="libx264")

    return temp_file.name
