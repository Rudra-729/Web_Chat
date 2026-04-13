import { useState, useEffect, useRef } from "react";
import "./call.css";

const CallOverlay = ({ user, type = "voice", onHangUp }) => {
  const [status, setStatus] = useState("calling"); // 'calling' | 'connected'
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [videoOff, setVideoOff] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  // Simulate connecting after 3s
  useEffect(() => {
    const t = setTimeout(() => setStatus("connected"), 3000);
    return () => clearTimeout(t);
  }, []);

  // Duration counter once connected
  useEffect(() => {
    if (status !== "connected") return;
    const iv = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(iv);
  }, [status]);

  // Request camera for video calls
  useEffect(() => {
    if (type !== "video") return;
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        setCameraStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {});
    return () => {
      cameraStream?.getTracks().forEach((t) => t.stop());
    };
  }, [type]); // eslint-disable-line

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const handleHangUp = () => {
    cameraStream?.getTracks().forEach((t) => t.stop());
    onHangUp();
  };

  return (
    <div className="callOverlay">
      <div className="callBg" />
      <div className="callContent">
        {/* Video preview or avatar */}
        {type === "video" ? (
          <div className="videoPreview" style={{ position: "relative" }}>
            {cameraStream && !videoOff ? (
              <video ref={videoRef} autoPlay muted playsInline />
            ) : (
              <div className="noCamera">
                <span>{videoOff ? "📵" : "📷"}</span>
                <span>{videoOff ? "Camera off" : "Starting camera…"}</span>
              </div>
            )}
            <div className="selfPreview">😊</div>
          </div>
        ) : (
          <div className={`callAvatar ${status === "calling" ? "pulsing" : ""}`}>
            <img src={user?.avatar || "./avatar.png"} alt="" />
          </div>
        )}

        <h2>{user?.username || "Unknown"}</h2>

        <div className="callTypeBadge">
          {type === "video" ? "📹" : "📞"}
          <span>{type === "video" ? "Video Call" : "Voice Call"}</span>
        </div>

        <div className="callStatus">
          {status === "calling" ? (
            "Calling…"
          ) : (
            <>
              <span className="dot" />
              {formatTime(duration)}
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="callActions">
          {/* Mute */}
          <button
            className={`callBtn muteBtn ${muted ? "muted" : ""}`}
            onClick={() => setMuted((m) => !m)}
          >
            {muted ? "🚫" : "🎤"}
            <span className="btnLabel">{muted ? "Unmute" : "Mute"}</span>
          </button>

          {/* Video toggle (video calls only) */}
          {type === "video" && (
            <button
              className="callBtn videoToggleBtn"
              onClick={() => setVideoOff((v) => !v)}
            >
              {videoOff ? "📷" : "📹"}
              <span className="btnLabel">{videoOff ? "Cam On" : "Cam Off"}</span>
            </button>
          )}

          {/* Hang up — center */}
          <button className="hangupBtn" onClick={handleHangUp}>
            📵
            <span className="btnLabel">End</span>
          </button>

          {/* Speaker */}
          <button
            className="callBtn speakerBtn"
            onClick={() => setSpeakerOn((s) => !s)}
          >
            {speakerOn ? "🔊" : "🔇"}
            <span className="btnLabel">{speakerOn ? "Speaker" : "Earpiece"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallOverlay;
