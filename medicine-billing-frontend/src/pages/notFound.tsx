import { Link } from "react-router-dom";
import { ROUTES } from "../constants";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-800">404</h1>
        <p className="text-gray-600">Page not found.</p>
        <Link to={ROUTES.DASHBOARD} className="inline-block text-blue-600">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
