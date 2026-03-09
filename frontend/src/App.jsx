import React, { Suspense } from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';

function App() {
    return (
        <Suspense fallback={<LoadingSpinner fullScreen />}>
            <AppRoutes />
        </Suspense>
    );
}

export default App;
