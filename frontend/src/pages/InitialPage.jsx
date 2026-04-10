import { useNavigate } from "react-router-dom";

function InitialPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-800 text-white flex flex-col">
      {/* Main content - grows to push footer down */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-xl text-center mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            Welcome to ColabCode
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed">
            Collaborate on code in real-time with your friends or team. Create rooms instantly or join an existing
            session to write, run, and share code seamlessly.
          </p>
        </div>

        <div className="flex flex-col items-center border-2 border-gray-600 p-4 md:p-6 rounded-lg bg-gray-900 max-w-sm md:max-w-md w-full gap-4 md:gap-6">
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Get Started</h2>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full">
            <button
              onClick={() => navigate("/join")}
              className="bg-blue-500 text-white p-3 md:p-3 rounded-lg flex-grow hover:bg-blue-600 transition-colors font-medium"
            >
              Join Room
            </button>
            <button
              onClick={() => navigate("/create")}
              className="bg-green-600 text-white p-3 md:p-3 rounded-lg flex-grow hover:bg-green-700 transition-colors font-medium"
            >
              Create Room
            </button>
          </div>
        </div>
      </div>
    {/* Footer - always at bottom */}
      <footer className="bg-gray-900 border-t border-gray-700 py-4 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-400">
          <p>
            © 2025 ColabCode. All rights reserved.
          </p>
          <p>
            Developed by{" "}
            <a
              href="https://www.linkedin.com/in/anuja-mishra-1193a2245"
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Anuja Mishra
            </a>
          </p>
        </div>
      </footer>
      
    </div>
  );
}

export default InitialPage;