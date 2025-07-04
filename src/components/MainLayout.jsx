import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="sticky top-0 h-screen">
                <Sidebar className="h-full" />
            </div>

            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <Header />
                
                <main className="flex-1 p-6 bg-white overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;