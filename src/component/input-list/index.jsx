import React, {useState} from 'react';
import './index.css';


const InputList = ({defaultList, onChange}) => {
  const [inputList, setInputList] = useState(defaultList);

  return <div className="input-list">
    {defaultList.map((item, index) => {
      return <div className='input-item' key={index}>
        <span>句子 {index}</span>
        <input value={item} onChange={(e) => {
          inputList[index] = e.target.value;
          const newList = [...inputList];
          // setInputList(newList);
          onChange(newList);
        }} placeholder={item}/>
      </div>
    })}
  </div>
}

export default InputList;
