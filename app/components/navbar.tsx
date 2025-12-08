import { UserButton } from '@clerk/nextjs';
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server';

async function Navbar() {
    const { userId } = await auth();
    return (
        <nav className='p-4 flex flex-row justify-between items-center border-b border-b-gray-200 backdrop-blur-2xl shadow-gray-50'>
            <h1 className='text-2xl font-bold text-gray-900'>LinkedIn Post Generator</h1>
            {userId ? <div><UserButton /></div> : <div className='space-x-4'><SignInButton><button className='px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:bg-[#0a66c2ed] font-semibold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105'>SignIn
            </button></SignInButton> <SignUpButton><button className='border-2 border-gray-200 px-4 py-2 hover:border-[#0A66C2]  text-[#0A66C2] rounded-lg  font-semibold text-lg transition shadow-lg hover:shadow-xl transform hover:scale-105'>SignUp</button></SignUpButton></div>}
        </nav>
    )
}

export default Navbar