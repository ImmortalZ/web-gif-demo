import React, {useState, useRef, useEffect} from 'react';
import {makeMainThreadBusy, mockMainThreadBusy} from "../../utils";

let showText = '';

function updateText(str) {
  showText += str + '\n';
  document.getElementById('text-content-3').innerText = showText;
}

const Demo3 = () => {
  const [worker, setWorker] = useState();
  const canvasRef = useRef();

  useEffect(() => {
    const renderCanvas = document.getElementById('render-canvas');
    const captureWorker = new Worker('http://localhost:3000/worker_offscreen.js');
    captureWorker.onmessage = function (msg) {
      if (msg.data.method === 'transfer') {
        const buffer = msg.data.buffer;
        const url = URL.createObjectURL(new Blob([buffer], {type: 'image/png'}));
      } else if (msg.data.method === 'updateText') {
        updateText(msg.data.text);
      }
    };
    setWorker(captureWorker);
  }, []);

  return <div className="demo">
    <h3>demo4：worker线程解码 + offlineCanvas(异步模式)</h3>
    <canvas id='render-canvas' ref={canvasRef}/>
    <div id='text-content-3'></div>
    <div className="actions">
      <button onClick={makeMainThreadBusy}>主线程busy</button>
      <button onClick={mockMainThreadBusy}>模拟主线程5s内间断忙碌</button>
      <button onClick={() => {
        if (!worker) {
          return;
        }
        const offscreen = canvasRef.current.transferControlToOffscreen();
        worker.postMessage({
          method: 'init', canvas: offscreen,
        }, [offscreen])
      }}>worker+offlineCanvas
      </button>
    </div>
  </div>;
}

export default Demo3;
