import React, {useState} from 'react';
import Demo1 from './component/demo-1';
import Demo2 from './component/demo-2';
import Demo4 from './component/demo-4';
import Demo3 from './component/demo-3';
import GifMake from './component/gif-make';
import './App.css';

function App() {
  const [status, setStatus] = useState('free');

  return (<div className="App">
    <video width={300} height={169} controls>
      <source src="http://localhost:3000/1/template.mp4" type="video/mp4" />
    </video>
    {/*主线程解码+主线程渲染*/}
    <Demo1 />
    <Demo2 />
    <Demo3 />
    <Demo4 />
    <GifMake />
  </div>);
}

export default App;
