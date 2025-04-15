# from moviepy.video.io.VideoFileClip import VideoFileClip
# from moviepy.audio.io.AudioFileClip import AudioFileClip
# import tempfile

# def clip_video(file_content, start, end):
#   with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:

#     temp_file.write(file_content)
#     temp_filename = temp_file.name

#   with VideoFileClip(temp_filename) as video_clip:

#       trimmed_video = video_clip.subclipped(start, end)

#       with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as trimmed_video_filename:

#         trimmed_video.write_videofile(trimmed_video_filename.name, codec="libx264")

#         # Send the file to the browser
#         return trimmed_video_filename.name

# def clip_audio(file_content, start, end):
#   with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:

#     temp_file.write(file_content)
#     temp_filename = temp_file.name

#   with AudioFileClip(temp_filename) as audio_clip:

#       trimmed_audio = audio_clip.subclipped(start, end)

#       with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as trimmed_audio_filename:

#         trimmed_audio.write_audiofile(trimmed_audio_filename.name)

#         # Send the file to the browser
#         return trimmed_audio_filename.name

# def merge_audio_video(video_stream, audio_stream=None, start=None, end=None):
#   with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:

#     temp_video.write(video_stream)
#     video_path = temp_video.name
    
#     video_clip = VideoFileClip(video_path)

#     if audio_stream:
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:

#           temp_audio.write(audio_stream)
#           audio_path = temp_audio.name
          
#           audio_clip = AudioFileClip(audio_path)
#           video_clip = video_clip.with_audio(audio_clip)
          
    
#     if start and end:
#       video_clip = video_clip.subclipped(start, end)

#     video_clip.write_videofile(video_path)

#     audio_clip.close()
#     video_clip.close()

#     return video_path

    
    
  
  
  
#   # with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_file:

#     audio = AudioFileClip(audio_file)
#     video = VideoFileClip(video_file)

#     video = video.with_audio(audio)

#     video.write_videofile(temp_file.name, codec="libx264")

#     return temp_file.name

import ffmpeg

def merge_audio_video(
    video_path,
    audio_path,
    output_path,
    start=None,
    end=None,
):
  """Merge audio and video files using ffmpeg.
  Args:
      video_path (str): Path to the video file.
      audio_path (str): Path to the audio file.
      output_path (str): Path to save the merged file.
      start (int, optional): Start time in seconds. Defaults to None.
      end (int, optional): End time in seconds. Defaults to None.
  """
  try:
    video = ffmpeg.input(video_path)
    audio = ffmpeg.input(audio_path)

    (
      ffmpeg
      .output(
        video,
        audio,
        output_path,
        vcodec='copy',
        acodec='aac',
        strict='experimental',

        # ss=str(start) if start else '0',
        # to=str(end) if end else None,
        )
        .overwrite_output()
      .run(quiet=True)
    )

  except ffmpeg.Error as e:
    raise Exception(f"ffmpeg error: {str(e)}")