import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Notification = () => {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="dark"
      toastStyle={{
        background: "rgba(12, 18, 40, 0.97)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(99, 102, 241, 0.2)",
        borderRadius: "12px",
        color: "#f1f5f9",
        fontSize: "14px",
        fontFamily: "'Inter', sans-serif",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
      }}
    />
  );
};

export default Notification;