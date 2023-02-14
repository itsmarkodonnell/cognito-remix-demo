import { json, LoaderArgs } from "@remix-run/node";
import { Link } from "react-router-dom";

export async function loader({ request, context, params }: LoaderArgs) {
  return json({});
}

export default function Index() {
  return (
    <div className="bg-gray-100 h-screen flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-6">Demo cognito login with Remix</h1>
      <div className="flex space-x-4">
        <Link to="/dashboard" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Go to protected route (will re-route if not logged in)</Link>
        <Link to="/login" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Go to login</Link>
      </div>
    </div>

  );
}
