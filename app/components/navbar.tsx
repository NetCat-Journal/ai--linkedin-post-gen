import { UserButton } from '@clerk/nextjs'


function Navbar() {
    return (
        <nav className='p-4 flex flex-row justify-between items-center border-b border-b-gray-200 backdrop-blur-2xl shadow-gray-50'>
            <div className='text-[#0A66C2] font-medium'>Linkind Post Generator</div>
            <div><UserButton /></div>
        </nav>
    )
}

export default Navbar