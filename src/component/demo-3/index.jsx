import React, {useState, useRef, useEffect} from 'react';
import {makeMainThreadBusy, mockMainThreadBusy} from "../../utils";

let showText = '';

function updateText(str) {
  showText += str + '\n';
  document.getElementById('text-content-4').innerText = showText;
}

const Demo4 = () => {
  const [worker, setWorker] = useState();
  const canvasRef = useRef();

  useEffect(() => {
    const renderCanvas = document.getElementById('render-canvas-4');
    renderCanvas.width = 480;
    renderCanvas.height = 270;
    const ctx = renderCanvas.getContext('2d');

    const worker = new Worker('http://localhost:3000/worker_offscreen_transfer.js');
    worker.onmessage = function (msg) {
      if (msg.data.method === 'transfer') {
        const buffer = msg.data.buffer;
        ctx.drawImage(buffer, 0, 0);
      } else if (msg.data.method === 'updateText') {
        updateText(msg.data.text);
      }
    };
    setWorker(worker);
  }, []);

  return <div className="demo">
    <h3>demo3：worker线程解码 + offlineCanvas(同步模式)</h3>
    <canvas id='render-canvas-4' ref={canvasRef}/>
    <div id='text-content-4'></div>
    <div className="actions">
      <button onClick={makeMainThreadBusy}>主线程busy</button>
      <button onClick={mockMainThreadBusy}>模拟主线程5s内间断忙碌</button>
      <button onClick={() => {
        if (!worker) {
          return;
        }
        worker.postMessage({
          method: 'init'
        })
      }}>worker+offlineCanvas
      </button>
    </div>
  </div>;
}

export default Demo4;
