/**
 * Teachers can create a class by creating a link and if it is a student they are able to join the zoom link generated by the teacher
 */

import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { Layout } from "../components/Layout";
import { api } from "../api";
import { StoreContext } from "../store";
import { TokenContextType } from "../types";

export const ClassPage = () => {
  const { courseCode } = useParams();
  const tokenContext: TokenContextType = useContext(StoreContext);
  const [zoomLink, setZoomLink] = useState<string>('');

  // Generate a new zoom link for users to join
  const handleStartNewClass = async () => {
    try {
      const newZoom = await api
        .post('/generate/zoom', {
          'course_code': courseCode,
          'token': tokenContext.token
        })
        .then(res => res.data);
      setZoomLink(newZoom.zoom_url);
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
    }
  }

  // Copy the link and paste it on the page for users in the course to join
  const handleCopyLink = () => {
    navigator.clipboard.writeText(zoomLink);
  }

  const handleJoinClass = () => {
    window.open(zoomLink);
  }

  useEffect(() => {
    const getZoomLink = async () => {
      try {
        const existingZoom = await api
          .get('/get/zoom', {
            params: {
              'course_code': courseCode,
              'token': tokenContext.token,
            }
          })
          .then(res => res.data);
        if (existingZoom.zoom_url) {
          setZoomLink(existingZoom.zoom_url);
        }
      } catch (err) {
        if (err instanceof Error) {
          console.log(err);
        }
      }
    }
    getZoomLink();
  }, [])

  return (
    <Layout>
      <div className='flex text-2xl justify-between item-center border-b border-slate pb-4'>
        <h1>Class for {courseCode}</h1>
      </div>
      <div className='flex flex-col p-20 text-left'>
        <label>Class zoom link</label>
        <div className='flex justify-center items-center gap-2'>
          <input readOnly={true} className='text-l w-full rounded border px-2 h-10 border-slate-400' value={zoomLink}></input>
          <button onClick={handleCopyLink} className='px-2 bg-slate-500   text-white rounded-md h-10 hover:bg-slate-600'>
            Copy
          </button>
        </div>
      </div>
      <div className='flex justify-center'>
        {tokenContext.isTeacher && <button onClick={handleStartNewClass} className="bg-blue-500 text-white w-1/2 rounded-lg h-10 hover:bg-blue-600">
          Start new class
        </button>
        }
        {!tokenContext.isTeacher && zoomLink !== '' ? <button onClick={handleJoinClass} className="bg-blue-500 text-white w-1/2 rounded-lg h-10 hover:bg-blue-600">
          Join class
        </button> : null}
        {!tokenContext.isTeacher && zoomLink === '' ? <button disabled className="bg-slate-300 text-white w-1/2 rounded-lg h-10">
          No active class
        </button> : null}
      </div>
    </Layout>
  )
}