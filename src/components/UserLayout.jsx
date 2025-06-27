import { Outlet } from "react-router-dom";
import SidebarUser from "./SidebarUser";
import UserHeader from "./UserHeader";

export default function UserLayout() {
    return (
       
   <div className="flex min-h-screen bg-gray-100">
            <div className="sticky top-0 h-screen">
                <SidebarUser className="h-full" />
            </div>
            
            {/* Konten utama */}
            <div className="flex-1 flex flex-col min-h-screen">
                <UserHeader />
                <main className="flex-1 p-6 bg-white">
                    <Outlet />
                </main>
            </div>
        </div>

    );
};
