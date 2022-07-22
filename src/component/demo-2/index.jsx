import React, {useState, useRef, useEffect} from 'react';
import {makeMainThreadBusy, mockMainThreadBusy} from "../../utils";

let showText = '';

function updateText(str) {
  showText += str + '\n';
  document.getElementById('text-content-2').innerText = showText;
}

const Demo2 = () => {
  const [normalWorker, setNormalWorker] = useState();
  const workerCanvasRef = useRef();

  useEffect(() => {
    const ctx = workerCanvasRef.current.getContext("2d");
    workerCanvasRef.current.width = 480;
    workerCanvasRef.current.height = 270;

    const normalWorker = new Worker('http://localhost:3000/normal_worker.js');
    normalWorker.onmessage = async function (msg) {
      if (msg.data.method === 'transfer') {
        const imageBitmap = await createImageBitmap(new Blob([msg.data.buffer]));
        ctx.drawImage(imageBitmap, 0, 0);
      } else if (msg.data.method === 'updateText') {
        updateText(msg.data.text);
      }
    };
    setNormalWorker(normalWorker);
  }, []);

  return <div className="demo">
    <h3>demo2：worker线程解码 + 主线程canvas渲染</h3>
    <canvas id='worker-canvas' ref={workerCanvasRef}/>
    <div id='text-content-2'></div>
    <div className="actions">
      <button onClick={makeMainThreadBusy}>主线程busy</button>
      <button onClick={mockMainThreadBusy}>模拟主线程5s内间断忙碌</button>
      <button onClick={() => {
        normalWorker.postMessage({
          method: 'init'
        })
      }}>worker线程解码渲染
      </button>
    </div>
  </div>;
}

export default Demo2;
