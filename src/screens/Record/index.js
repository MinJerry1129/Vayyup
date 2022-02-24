import React, {useState, useEffect} from 'react';
import VideoRecorder from './VideoRecorder';
import EnterDetails from './EnterDetails';
import Introduction from './Introduction';
import {setSuccessVideo} from 'src/redux/reducers/video.actions';
import {useDispatch} from 'react-redux';
import firebase from '@react-native-firebase/app';

const Status = {
  Introduction: 'Introduction',
  Recording: 'Recording',
  EnterDetails: 'EnterDetails',
};

const Record = ({ route }) => {
  const { params = {} } = route;
  const { competition = {} } = params;
  const [status, setStatus] = useState(Status.Introduction);
  const [karaokeVideo, setKaraokeVideo] = useState({});
  const [uploadVideo, setUploadVideo] = useState(false);
  const [type, setType] = useState('');
  const [karaokeType, setKaraokeType] = useState(false);
  const [video, setVideo] = useState();
  const [lagTime, setLagTime] = useState(0);
  const dispatch = useDispatch();

  const changeStatus = newStatus => {
    setStatus(newStatus);
  };

  useEffect(async () => {
    const snapshot = await firebase
      .firestore()
      .collection('successimage')
      .get();

    var length = snapshot.docs.length;
    var randomIndex = Math.min(Math.floor(Math.random() * length), length);
    var randomImages = snapshot.docs[randomIndex]._data;

    dispatch(setSuccessVideo(randomImages.image));
  }, []);

  const handleStartRecording = (karaoke, _type, karaokeType) => {
    setKaraokeVideo(karaoke);
    setType(_type);
    setStatus(Status.Recording);
    setKaraokeType(karaokeType);
  };
  const handleSwitchType = type => {
    setType(type);
  };
  const handleFinishRecording = (recordedVideo, time) => {

    setVideo(recordedVideo);
    setLagTime(time);
    setStatus(Status.EnterDetails);
  };

  const handleUploadVideo = selectedVideo => {
    setVideo(selectedVideo);
    setUploadVideo(true);
    setStatus(Status.EnterDetails);
  };

  const handleCancel = () => {
    setStatus(Status.Introduction);
  };

  return (
    <>
      {status === Status.Introduction && (
        <Introduction
          competition={competition}
          onStartRecording={handleStartRecording}
          onUploadVideo={handleUploadVideo}
          onHandleType={handleSwitchType}
          singType={type}
        />
      )}
      {status === Status.Recording && (
        <VideoRecorder
          karaokeVideo={karaokeVideo}
          type={type}
          karaokeType={karaokeType}
          onCloseCamera={changeStatus.bind(this, Status.Introduction)}
          onFinishRecording={handleFinishRecording}
        />
      )}

      {status === Status.EnterDetails && (
        <EnterDetails
          karaokeVideo={karaokeVideo}
          type={type}
          video={video}
          karaokeType={karaokeType}
          lagTime={lagTime}
          competition={competition}
          uploadVideo={uploadVideo}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default Record;
