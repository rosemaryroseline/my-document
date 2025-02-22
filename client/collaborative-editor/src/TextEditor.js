import React, { useCallback, useEffect, useState } from 'react'
import './styles.css'
import Quill from 'quill'
import "quill/dist/quill.snow.css"
import { io } from 'socket.io-client'
import {useParams} from 'react-router-dom'
const SAVE_INTERVAL_MS=2000;

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['bold', 'italic', 'underline'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ align: [] }],
    [ 'blockquote', 'code-block']
]

export default function TextEditor() {
    const {id:documentId}=useParams()
    console.log(documentId);

    const [socket, setSocket] = useState(null)
    const [quill, setQuill] = useState(null);


    useEffect(() => {
        const s = io('http://localhost:3001')
        setSocket(s);
        return () => {
            s.disconnect()
        }
    }, [])

    useEffect(()=>{
  if(socket==null || quill ==null)return
  console.log('one')
  socket.once('load-document',document=>{
   

    quill.setContents(document);
    

    quill.enable();
  })
  socket.emit('get-document',documentId)
  console.log('four')

    },[socket,quill,documentId])

    useEffect(()=>{
const interval=setInterval(()=>{
socket.emit('save-document',quill.getContents())
},SAVE_INTERVAL_MS)
return ()=>{
    clearInterval(interval)
}
    },[socket,quill])

    useEffect(() => {
        if (socket == null || quill == null) return
        const handler = delta => {
           quill.updateContents(delta)
        }
        socket.on('receive-changes',handler);
        // Quill.on('text-change',)
        return () => {
            socket.off('receive-changes', handler)
        }
    }, [socket, quill]);


    useEffect(() => {
        if (socket == null || quill == null) return
        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') return
            socket.emit('send-changes', delta)
        }
        quill.on('text-change',handler);
        // Quill.on('text-change',)
        return () => {
            quill.off('text-change', handler)
        }
    }, [socket, quill]);

    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return
        wrapper.innerHTML = " "
        const editor = document.createElement('div')
        wrapper.append(editor)
        const q = new Quill(editor, { theme: "snow", modules: { toolbar: TOOLBAR_OPTIONS } 
        })
        q.disable()
       
        q.setText('Loading...')
        console.log('six')
        setQuill(q)
        
        // return()=>{
        //     wrapperRef.innerHTML=""
        // }
    }, [])


    return (
        <div className='container' ref={wrapperRef}>

        </div>
    )
}