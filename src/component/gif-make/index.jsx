import React, {useState, useRef, useEffect} from 'react';
import InputList from "../input-list";

import './index.css';

const defaultList = ['好啊', '就算你是一流工程师', '就算你出报告再完美', '我叫你改报告你就要改', '毕竟我是客户', '客户了不起啊', 'sorry 客户真的了不起', '以后叫他天天改报告', '天天改 天天改']

const GifMake = () => {
  const [gifInputList, setGifInputList] = useState(defaultList);
  const [gifSrc, setGifSrc] = useState('');
  const [gifWorker, setGifWorker] = useState();
  const gifCanvasRef = useRef();

  useEffect(() => {
    const gifWorker = new Worker('http://localhost:3000/gif_worker_offscreen.js');
    gifWorker.onmessage = function (msg) {
      if (msg.data.method === 'transfer') {
        console.log('[debug] ==> 获取数据', msg.data.url);
        setGifSrc(msg.data.url);
      }
    };
    setGifWorker(gifWorker);
  }, []);

  return <div className="gif-make">
    <h3>实战：实现在线版gif字幕</h3>
    <div className='gif-make-row'>
      <div className='gif'>
        <span>gif</span>
        <div className="demo-gif">
          {gifSrc && <img src={gifSrc}/>}
        </div>
        <div className="actions">
          <InputList defaultList={gifInputList} onChange={(inputList) => {
            setGifInputList(inputList);
          }}/>
          <button onClick={() => {
            if (!gifWorker) {
              return;
            }
            const offscreen = gifCanvasRef.current.transferControlToOffscreen();
            gifWorker.postMessage({
              method: 'init', canvas: offscreen, inputList: gifInputList,
            }, [offscreen])
          }}>生成gif
          </button>
        </div>
      </div>
      <div className='canvas-preview'>
        <span>canvas预览</span>
        <canvas id='gif-canvas' ref={gifCanvasRef}/>
        <button onClick={() => {
          if (!gifWorker) {
            return;
          }
          gifWorker.postMessage({
            method: 'pause'
          })
        }}>pause
        </button>
        <button onClick={() => {
          if (!gifWorker) {
            return;
          }
          gifWorker.postMessage({
            method: 'play'
          })
        }}>play
        </button>
        <button onClick={() => {
          if (!gifWorker) {
            return;
          }
          gifWorker.postMessage({
            method: 'replay', inputList: gifInputList
          })
        }}>replay
        </button>
      </div>
    </div>
  </div>
}

export default GifMake;
