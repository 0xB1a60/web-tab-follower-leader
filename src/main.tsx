import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {TYPE_TAB_DEATH} from "./base/LeaderFollowerConst.ts";

const worker = new Worker(new URL("./base/LeaderFollowerWorker.ts", import.meta.url), {
    type: 'module',
});

worker.onerror = (e: ErrorEvent) => {
    console.log("worker err", e.error);
}

worker.onmessageerror = (e) => {
    console.log("worker message error", e);
}

window.onunload = () => worker.postMessage({type: TYPE_TAB_DEATH});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
)
