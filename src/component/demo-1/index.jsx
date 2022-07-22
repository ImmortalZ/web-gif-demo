import React, {useRef} from 'react';
import {createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg';
import {makeMainThreadBusy, mockMainThreadBusy} from "../../utils";

let showText = '';
let playTimer = null;

function updateText(str) {
  showText += str + '\n';
  document.getElementById('text-content-1').innerText = showText;
}

async function runInMainThread(canvas) {
  updateText(`开始加载 ${Date.now()}`);
  const ctx = canvas.getContext("2d");
  canvas.width = 480;
  canvas.height = 270;
  const fps = 40;
  let duration = -1;
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
    }, log: false,
  });
  await ffmpeg.load();
  updateText(`开始解码 ${Date.now()}`);
  const decodeStartTime = Date.now();
  ffmpeg.FS('writeFile', 'template.mp4', await fetchFile('http://localhost:3000/1/template.mp4'));
  await ffmpeg.run('-i', 'template.mp4', '-vf', 'fps=25', '-s', '480x270', 'image%d.jpg');
  console.log('[debug] ==> 解码耗时', Date.now() - decodeStartTime);
  updateText(`解码耗时 ${Date.now() - decodeStartTime}`);
  // 渲染绘制
  const totalLength = Math.floor(duration / fps);
  let i = 0;
  clearInterval(playTimer);
  const renderStartTime = Date.now();
  updateText(`开始渲染 ${renderStartTime}`);
  playTimer = setInterval(async () => {
    i++;
    if (i === totalLength) {
      clearInterval(playTimer);
      updateText(`渲染结束 ${Date.now() - renderStartTime}`);
      return;
    }
    const data = ffmpeg.FS('readFile', `image${i}.jpg`);
    const imageBitmap = await createImageBitmap(new Blob([data.buffer]));
    ctx.drawImage(imageBitmap, 0, 0);
  }, fps);
}

const Demo1 = ({}) => {
  const mainCanvasRef = useRef();

  return <div className="demo">
    <h3>demo1：主线程解码 + 主线程canvas渲染</h3>
    <canvas id='main-canvas' ref={mainCanvasRef}/>
    <div id='text-content-1'></div>
    <div className="actions">
      <button onClick={makeMainThreadBusy}>主线程busy</button>
      <button onClick={mockMainThreadBusy}>模拟主线程5s内间断忙碌</button>
      <button onClick={() => {
        runInMainThread(mainCanvasRef.current);
      }}>主线程渲染
      </button>
    </div>
  </div>;
}

export default Demo1;
