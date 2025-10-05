import { Routes, Route, Navigate } from "react-router-dom";

import { LoginPages } from "../auth";
import { ProjectsPages } from "../projects";

export const AppRouter = () => {
    const authStatus = 'noAutenticado';

    return (
        <Routes>
            {(authStatus === 'noAutenticado')
                ? <Route path="/auth/*" element={<LoginPages />} />
                : <Route path="/*" element={< ProjectsPages />} />
            }

            <Route path="/*" element={<Navigate to={"/auth/login"} />} />

        </Routes>
    );
};