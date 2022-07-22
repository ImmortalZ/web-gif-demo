importScripts('/ffmpeg.dev.js');
const {createFFmpeg, fetchFile} = self.FFmpeg;
let duration = -1;
const timeInterval = 50;
const ffmpeg = createFFmpeg({
  corePath: 'http://localhost:3000/ffmpeg-core.js', logger: (message) => {
    const regex = /Duration: (\d{2})\:(\d{2})\:(\d{2})\.(\d{2})/gm;
    const matches = regex.exec(String(message.message));
    if (matches != null) {
      const h = Number(matches[1]);
      const m = Number(matches[2]);
      const s = Number(matches[3]);
      const ms = Number(matches[4]);
      duration = (h * 3600 + m * 60 + s + ms / 100) * 1000;
    }
  }, log: true,
});

function toUint8Arr(str) {
  const buffer = [];
  for (let i of str) {
    const _code = i.charCodeAt(0);
    if (_code < 0x80) {
      buffer.push(_code);
    } else if (_code < 0x800) {
      buffer.push(0xc0 + (_code >> 6));
      buffer.push(0x80 + (_code & 0x3f));
    } else if (_code < 0x10000) {
      buffer.push(0xe0 + (_code >> 12));
      buffer.push(0x80 + (_code >> 6 & 0x3f));
      buffer.push(0x80 + (_code & 0x3f));
    }
  }
  return Uint8Array.from(buffer);
}

async function replaceAssTemplate(inputList) {
  return new Promise(async resolve => {
    const assFileData = await fetchFile('http://localhost:3000/1/template.ass');
    console.log('[debug] ==> assFileData assFileData', assFileData);
    const reader = new FileReader();
    reader.readAsText(new Blob([assFileData.buffer]), 'utf-8');
    reader.onload = function (e) {
      let str = reader.result;
      str = str.replace('{{ sentences[0] }}', inputList[0]);
      str = str.replace('{{ sentences[1] }}', inputList[1]);
      str = str.replace('{{ sentences[2] }}', inputList[2]);
      str = str.replace('{{ sentences[3] }}', inputList[3]);
      str = str.replace('{{ sentences[4] }}', inputList[4]);
      str = str.replace('{{ sentences[5] }}', inputList[5]);
      str = str.replace('{{ sentences[6] }}', inputList[6]);
      str = str.replace('{{ sentences[7] }}', inputList[7]);
      str = str.replace('{{ sentences[8] }}', inputList[8]);
      console.log('[debug] ==> str', str);
      resolve(toUint8Arr(str));
    }
  });
}

function init() {

}

function pause() {
  canPlay = false;
}

function play() {
  canPlay = true;
}

async function playCore(ctx) {
  const totalLength = Math.floor(duration / timeInterval);
  clearInterval(playTimer);
  play();
  playTimer = setInterval(async () => {
    if (!canPlay) {
      return;
    }
    playIndex++;
    if (playIndex === totalLength) {
      clearInterval(playTimer);
      return;
    }
    const data = ffmpeg.FS('readFile', `image${playIndex}.jpg`);
    const imageBitmap = await self.createImageBitmap(new Blob([data.buffer]));
    ctx.drawImage(imageBitmap, 0, 0);
  }, timeInterval);
}

async function decodeResource() {
  console.log('[debug] ==> decodeResource',);
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }
  ffmpeg.FS('writeFile', 'template.mp4', await fetchFile('http://localhost:3000/1/template.mp4'));
  ffmpeg.FS('writeFile', 'template.ass', await replaceAssTemplate(inputList));
  ffmpeg.FS('writeFile', 'tmp/SourceSansPro-Bold', await fetchFile('http://localhost:3000/1/yahei.ttf'));
  await ffmpeg.run('-i', 'template.mp4', '-vf', "subtitles=template.ass:fontsdir=/tmp:force_style='Fontname=Microsoft YaHei'", 'export.gif');
  const data = ffmpeg.FS('readFile', 'export.gif');
  const url = URL.createObjectURL(new Blob([data.buffer], {type: 'image/gif'}));
  postMessage({method: "transfer", url});
  await ffmpeg.run('-i', 'export.gif', '-ss', '00:00:00','-vf', 'fps=20', '-s', '480x270', 'image%d.jpg');
}

let playIndex = 0;
let playTimer = null;
let canPlay = true;
let ctx = null;
let canvas = null;
let inputList = [];

onmessage = async (event) => {
  const method = event.data.method;
  console.log('[debug] ==> method', method, event);
  if (method === 'init') {
    if (!canvas) {
      canvas = event.data.canvas;
      canvas.width = 480;
      canvas.height = 270;
      ctx = canvas.getContext("2d");
    }
    inputList = event.data.inputList;
    await decodeResource();
    await playCore(ctx);
  } else if (method === 'pause') {
    pause();
  } else if (method === 'play') {
    play();
  } else if (method === 'replay') {
    inputList = event.data.inputList;
    pause();
    playIndex = 0;
    await playCore(ctx);
  }
}

