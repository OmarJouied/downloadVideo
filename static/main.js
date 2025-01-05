const form = document.forms[0];
const cachedUrl = cacheUrl(handleVideoDownload);

form.onsubmit = async (e) => {
  e.preventDefault();
  const url = form["url"].value;

  if (!url) {
    alert('المرجوا إدخال رابط المقطع');
    return;
  }
  cachedUrl(url);
}

function cacheUrl(callback) {
  const urls = {};

  return (url) => {
    // if (!(url in urls)) {
    urls[url] = callback(url);
    // }
  }
}

async function handleVideoDownload(url) {
  const res = await fetch(`/info?url=${url}`);
  const { title, thumbnail_url, length, formats } = await res.json() ?? { title: "", thumbnail_url: "", length: 0, formats: [] };
  console.log({ title, thumbnail_url, length, formats })
  videos__container.prepend(
    videoDownloader({
      url, title, thumbnail_url, formats, length
    })
  );
}

function videoDownloader({ url, title, thumbnail_url, length, formats }) {
  return createElement({
    tag: 'div',
    options: {
      className: 'video__info',
    },
    childrens: [
      createElement({
        tag: 'img', options: {
          src: thumbnail_url,
          alt: title,
          className: 'thumbnail'
        }
      }),
      createElement({
        tag: 'div',
        options: {
          className: 'video-details-container',
        },
        childrens: [
          createElement({ tag: 'h2', options: { innerText: title } }),
          createElement({
            tag: 'form',
            childrens: [
              createElement({
                tag: 'div',
                childrens: [
                  createElement({
                    tag: 'label',
                    childrens: [
                      createElement({
                        tag: 'span', options: {
                          innerText: 'من'
                        }
                      }),
                      createElement({
                        tag: 'input', options: {
                          value: 0
                        }
                      }),
                    ],
                    options: {}
                  }),
                  createElement({
                    tag: 'label',
                    childrens: [
                      createElement({
                        tag: 'span', options: {
                          innerText: 'إلى'
                        }
                      }),
                      createElement({
                        tag: 'input', options: {
                          value: length
                        }
                      }),
                    ],
                    options: {}
                  }),
                  createElement({
                    tag: 'select',
                    options: {
                      className: 'video__info-formats'
                    },
                    childrens: formats.sort(
                      (a, b) => b.res.match(/\d+/)[0] - a.res.match(/\d+/)[0]
                    ).map(format => createElement({
                      tag: 'option',
                      options: {
                        innerText: format.res,
                        value: format.itag,
                      },
                    }))
                  }),
                ],
                options: {
                  className: 'trimme_video',
                }
              }),
              createElement({
                tag: 'button', options: {
                  innerText: 'Prepare Video',
                  className: 'video-prepare-button',
                }
              }),
            ],
            options: {
              onsubmit: async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const [{ value: start }, { value: end }, { value: itag }] = form;
                const link = `/download?itag=${itag}&start=${start}&end=${end}&url=${encodeURIComponent(url)}`;

                form.classList.add("loading");
                const video = await getVideo(link);
                form.classList.remove("loading");

                form.appendChild(createElement({
                  tag: 'div',
                  options: {
                    className: 'video-options',
                  },
                  childrens: [
                    createElement({
                      tag: "span",
                      options: {
                        innerText: `${start}:${end} ${formats.find(format => format.itag === +itag).res}`
                      }
                    }),
                    createElement({
                      tag: "button",
                      options: {
                        type: "button",
                        innerText: "watch",
                        className: "video-action-button",
                        style: "margin: 0",
                        onclick: () => watchVideo(video, title),
                      }
                    }),
                    createElement({
                      tag: "button",
                      options: {
                        type: "button",
                        innerText: "save",
                        className: "video-action-button",
                        style: "margin: 0",
                        onclick: () => saveVideo(video, title),
                      }
                    }),
                  ]
                }));
              }
            }
          })
        ]
      })
    ]
  })
}

function createElement({ tag, childrens, options }) {
  const ele = document.createElement(tag);
  Object.assign(ele, options ?? {});
  for (const children of childrens ?? []) {
    ele.appendChild(children);
  }
  return ele;
}

// function VideoInfo(url, title, thumbnail_url, formats, length) {
//   const thumbnail = createImage(thumbnail_url, title);
//   const videoDetailsContainer = createText("", "div");
//   const videoPrepareButton = createText("Prepare Video", "button");
//   videoPrepareButton.onclick = prepareVideo;

//   videoPrepareButton.className = "video-prepare-button";
//   videoDetailsContainer.className = "video-details-container";
//   const videoTitle = createText(title, "h2");

//   videoDetailsContainer.appendChild(videoTitle);
//   const downloadOptions = createText('', 'div');
//   downloadOptions.className = "trimme_video";

//   const labelStart = createText('', 'label');
//   const spanStart = createText('من', 'span');
//   const inputStart = createText('', 'input');
//   labelStart.appendChild(spanStart);
//   labelStart.appendChild(inputStart);
//   inputStart.value = 0;
//   inputStart.type = "number";
//   inputStart.name = "start";

//   downloadOptions.appendChild(labelStart);

//   const labelEnd = createText('', 'label');
//   const spanEnd = createText('إلى', 'span');
//   const inputEnd = createText('', 'input');
//   labelEnd.appendChild(spanEnd);
//   labelEnd.appendChild(inputEnd);
//   inputEnd.value = length;
//   inputEnd.type = "number";
//   inputEnd.name = "end";

//   downloadOptions.appendChild(labelEnd);
//   // <div class="trimme_video">
//   //         <label>
//   //           <span>من</span>
//   //           <input type="number" value="0" id="starter__time">
//   //         </label>
//   //         <label>
//   //           <span>إلى</span>
//   //           <input type="number" id="ender__time">
//   //         </label>
//   //       </div>
//   videoDetailsContainer.appendChild(createFormats(url, formats));

//   const video__info = createContainer(thumbnail, videoDetailsContainer, videoPrepareButton);
//   videos__container.prepend(video__info);
// }

// function createFormats(url, formats) {
//   const select = document.createElement("select");
//   select.className = "video__info-formats";

//   for (const format of formats) {
//     const option = createText(format.res, "option");
//     option.value = format.itag;
//     select.appendChild(option);
//   }
//   return select;
// }

// function createFormat(videoType, link, text) {
//   const format = document.createElement("div");
//   format.classList = "video__info-formats__format";
//   format.appendChild(createText(videoType, "p"));
//   format.appendChild(createLink(link, text));
//   return format;
// }

// function createLink(href, text) {
//   const link = createText(text, "a");
//   link.href = href;
//   link.className = "video__info-formats__format-link";
//   link.target = "_blank";
//   return link;
// }

// function createContainer(...elements) {
//   const video__info = createText('', 'div');
//   video__info.className = 'video__info';
//   for (const element of elements) {
//     video__info.appendChild(element);
//   }
//   return video__info;
// }

// function createImage(url, desc) {
//   const img = document.createElement("img");
//   img.src = url;
//   img.alt = desc;
//   return img;
// }

// function createText(text, tag) {
//   const textItem = document.createElement(tag);
//   const content = document.createTextNode(text);
//   textItem.appendChild(content);
//   return textItem;
// }

async function getVideo(link) {
  try {
    const res = await fetch(link);
    return await res.blob();
  } catch { }
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

async function watchVideo(video, videoTitle) {
  const src = URL.createObjectURL(video);

  const watchVideoDiv = createElement({
    tag: "div",
    options: {
      className: "watch-video",
    },
    childrens: [
      createElement({
        tag: "button",
        options: {
          type: "button",
          onclick: () => watchVideoDiv.remove()
        },
        childrens: [
          createElement({
            tag: "img",
            options: {
              src: '../static/closeIcon.svg'
            }
          })
        ]
      }),
      createElement({
        tag: "video",
        options: {
          autoplay: true,
          controls: true,
          src,
        }
      })
    ]
  })

  document.body.appendChild(watchVideoDiv);
}
function saveVideo(video, videoTitle) {
  const url = URL.createObjectURL(video);

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `${videoTitle}.mp4`;

  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}