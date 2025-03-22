import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, auth } from "../firebase/firebaseConfig";
import { setUser, clearUser } from "../redux/userSlice";
import { onAuthStateChanged } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        dispatch(
          setUser({
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
          })
        );
        navigate("/home");
      } else {
        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch, navigate]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-purple-50">
      
      {/* Login Section */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-purple-600 mb-6">TaskBuddy</h1>
          <p className="text-gray-600 mb-6 text-sm">
            Streamline your workflow and track progress effortlessly.
          </p>

          {/* Google Sign-in Button */}
          <button
            onClick={() => signInWithGoogle()}
            className="flex items-center justify-center gap-3 px-6 py-3 w-full bg-black text-white rounded-lg shadow-md hover:bg-gray-900 transition-all"
          >
            <FcGoogle className="text-2xl" />
            <span className="font-medium">Continue with Google</span>
          </button>
        </div>
      </div>

      {/* Circles Section - Desktop Right, Mobile Bottom */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-6">
        <svg
          viewBox="0 0 200 200"
          className="w-[80%] h-[80%] max-w-none opacity-30"
        >
          <circle cx="100" cy="100" r="80" stroke="#8B5CF6" strokeWidth="0.5" fill="none" opacity="0.3" />
          <circle cx="100" cy="100" r="60" stroke="#8B5CF6" strokeWidth="0.5" fill="none" opacity="0.5" />
          <circle cx="100" cy="100" r="40" stroke="#8B5CF6" strokeWidth="0.5" fill="none" opacity="0.7" />
        </svg>
      </div>
    </div>
  );
}
