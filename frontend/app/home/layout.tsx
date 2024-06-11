"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { GoInfo } from "react-icons/go";
import { TbActivityHeartbeat } from "react-icons/tb";
import { MdSensors } from "react-icons/md";
import { BsDatabaseFill } from "react-icons/bs";
import { MdLogout } from "react-icons/md";
import { BsArrowLeftShort } from "react-icons/bs";

export default function Layout({ children }: { children: React.ReactNode }) {
    let pathname = usePathname();
    const [openNavbar, setOpenNavbar] = useState(true);
    return (
        <div className='relative min-h-screen min-w-screen bg-gradient-to-b from-[#41D271] to-[#BD95EB]'>
            {children}
            <nav className={`absolute p-1 top-0 bottom-0 flex flex-col justify-between items-center z-10 bg-slate-200 ${openNavbar ? "translate-x-0" : "translate-x-[-40px]"} duration-500`}>
                <BsArrowLeftShort className={`absolute top-9 -right-3 border border-black bg-white rounded-full cursor-pointer text-2xl ${!openNavbar && "rotate-180"} duration-200`} onClick={ () => setOpenNavbar(!openNavbar)}/>
                <div>
                    <Image src={"/login.png"} alt="Homepage" width={30} height={30}></Image>
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <Link href="/home/metrics">
                        <button className="p-2 border-2 hover:border-black rounded border-transparent transition duration-300" title="metrics">
                            <TbActivityHeartbeat />
                        </button>
                    </Link>
                    <Link href="/home/metric_types">
                        <button className="p-2 border-2 hover:border-black rounded border-transparent transition duration-300" title="metric types">
                            <GoInfo />
                        </button>
                    </Link>
                    <Link href="/home/devices">
                        <button className="p-2 border-2 hover:border-black rounded border-transparent transition duration-300" title="devices">
                            <MdSensors />
                        </button>
                    </Link>
                    <Link href="/home/locations">
                        <button className="p-2 border-2 hover:border-black rounded border-transparent transition duration-300" title="locations">
                            <BsDatabaseFill />
                        </button>
                    </Link>
                </div>
                <button className="">
                    <MdLogout />
                </button>
            </nav>
        </div>
    )
}

