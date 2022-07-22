importScripts('/ffmpeg.dev.js');
const {createFFmpeg, fetchFile} = self.FFmpeg;
let duration = -1;
const fps = 40;
const ffmpeg = createFFmpeg({
  corePath: "http://localhost:3000/ffmpeg-core.js",
  logger: (message) => {
    const regex = /Duration: (\d{2})\:(\d{2})\:(\d{2})\.(\d{2})/gm;
    const matches = regex.exec(String(message.message));
    if (matches != null) {
      const h = Number(matches[1]);
      const m = Number(matches[2]);
      const s = Number(matches[3]);
      const ms = Number(matches[4]);
      duration = (h * 3600 + m * 60 + s + ms / 100) * 1000;
    }
  },
  log: false,
});

onmessage = async (event) => {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }
  ffmpeg.FS('writeFile', 'template.mp4', await fetchFile('http://localhost:3000/1/template.mp4'));
  let startTime = Date.now();
  postMessage({method: "updateText", text: `开始解码 ${startTime}`});
  await ffmpeg.run('-i', 'template.mp4', '-vf', 'fps=25', '-s', '480x270', 'image%d.jpg');
  postMessage({method: "updateText", text: `解码耗时 ${Date.now() - startTime}`});
  const totalLength = Math.floor(duration / fps);
  let i = 0;
  const renderStartTime = Date.now();
  postMessage({method: "updateText", text: `开始渲染 ${renderStartTime}`});
  const timer = setInterval(async () => {
    i++;
    if (i === totalLength) {
      clearInterval(timer);
      postMessage({method: "updateText", text: `渲染结束 ${Date.now() - renderStartTime}`});
      return;
    }
    const data = ffmpeg.FS('readFile', `image${i}.jpg`);
    postMessage({method: "transfer", buffer: data.buffer}, [data.buffer]);
  }, fps);
}

