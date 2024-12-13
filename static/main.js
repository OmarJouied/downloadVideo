const form = document.forms[0];
let videoTitle = '';
let videoLength = 0;

form.onsubmit = async (e) => {
  e.preventDefault();
  const url = form["video-url"].value;

  const res = await fetch(`/info?url=${url}`);
  const { title, thumbnail_url, length, formats } = await res.json();
  videoTitle = title;
  ender__time.value = length;
  videoLength = length;
  VideoInfo(url, title, thumbnail_url, formats)
}

function VideoInfo(url, title, thumbnail_url, formats) {
  const thumbnail = createImage(thumbnail_url, title);
  const videoDetailsContainer = createText("", "div");
  const videoPrepareButton = createText("Prepare Video", "button");
  videoPrepareButton.onclick = prepareVideo;

  videoPrepareButton.className = "video-prepare-button";
  videoDetailsContainer.className = "video-details-container";
  const videoTitle = createText(title, "h2");

  videoDetailsContainer.appendChild(videoTitle);
  videoDetailsContainer.appendChild(createFormats(url, formats));

  createContainer(thumbnail, videoDetailsContainer, videoPrepareButton);
}

function createFormats(url, formats) {
  const select = document.createElement("select");
  select.id = "itag__video";
  select.className = "video__info-formats"; // "itag": stream.itag, "res": stream.resolution, "type": stream.type

  for (const format of formats) {
    const option = createText(format.res, "option");
    option.value = format.itag;
    // select.appendChild(createFormat(format.type, `/download?itag=${format.itag}&start=${starter__time.value}&end=${ender__time.value}&url=${url}`, format.res));
    select.appendChild(option);
  }
  return select;
}

function createFormat(videoType, link, text) {
  const format = document.createElement("div");
  format.classList = "video__info-formats__format";
  format.appendChild(createText(videoType, "p"));
  format.appendChild(createLink(link, text));
  return format;
}

function createLink(href, text) {
  const link = createText(text, "a");
  link.href = href;
  link.className = "video__info-formats__format-link";
  link.target = "_blank";
  return link;
}

function createContainer(...elements) {
  for (const element of elements) {
    video__info.appendChild(element);
  }
}

function createImage(url, desc) {
  const img = document.createElement("img");
  img.src = url;
  img.alt = desc;
  return img;
}

function createText(text, tag) {
  const textItem = document.createElement(tag);
  const content = document.createTextNode(text);
  textItem.appendChild(content);
  return textItem;
}

async function prepareVideo(e) {
  const url = form["video-url"].value,
    start = starter__time.value,
    end = ender__time.value,
    itag = itag__video.value;

  const { target: element } = e;
  element.classList.add('loading');
  element.disabled = true;
  const res = await fetch(`/download?itag=${itag}&${(start > 0 && start < end) ? `start=${start}&` : ``}${end < videoLength && start < end ? `end=${end}&` : ``}url=${url}`);
  element.disabled = false;
  element.classList.remove('loading');
  if (!res.ok) {
    alert(res.status)
    return;
  }

  const data = await res.blob();

  console.log({ data })


  const watchVideo = element.cloneNode();
  watchVideo.innerText = 'watch video';

  const downloadVideo = element.cloneNode();
  downloadVideo.innerText = 'download video';
  downloadVideo.onclick = () => saveVideo(data);

  const prepareVideoContainer = document.createElement('div');
  prepareVideoContainer.className = "prepare-video-container"
  prepareVideoContainer.appendChild(watchVideo);
  prepareVideoContainer.appendChild(downloadVideo);

  element.parentNode.appendChild(prepareVideoContainer)

  element.remove();
  console.log({ element, watchVideo, watchVideo })
}

function saveVideo(blob) {
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `${videoTitle}.mp4`;

  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}