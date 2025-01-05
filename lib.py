from io import BytesIO

def filter_streams(video):
  formats = list(
    map(
      lambda stream: {
        "itag": stream.itag, "res": stream.resolution, "type": stream.mime_type.split('/')[0]
      }, video.filter(progressive=True, file_extension='mp4')
    )
  )

  for stream in video:
    if not is_exist_in_list_on_objects(formats, 'res', stream.resolution):
      formats.append({
        "itag": stream.itag, "res": stream.resolution, "type": stream.mime_type.split('/')[0]
      })

  return formats

def is_exist_in_list_on_objects(array, key, value):
  for obj in array:
    if obj[key] == value:
      return True
  return False

def get_stream(data):
  file_stream = BytesIO()
  data.stream_to_buffer(file_stream)
  file_stream.seek(0)
  
  return file_stream
