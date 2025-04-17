import React, {Suspense} from 'react';





const Loading = () => {
    return (<div className='min-h-screen flex justify-center items-center'>
        <span>Loading</span></div>
    )
}

/**
 * Auth 布局
 */
const AuthLayout = (
    {children}: { children: React.ReactNode }
) => {

    return (
        <>{children}</>

        /*<Suspense fallback={<Loading/>}>
            {children}
        </Suspense>*/
    );
};

export default AuthLayout;
