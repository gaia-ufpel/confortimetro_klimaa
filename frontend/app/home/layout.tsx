"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoInfo } from "react-icons/go";
import { TbActivityHeartbeat } from "react-icons/tb";
import { MdSensors } from "react-icons/md";
import { BsDatabaseFill } from "react-icons/bs";
import { MdLogout } from "react-icons/md";
export default function Layout({ children }: { children: React.ReactNode }) {
    let pathname = usePathname();
    return (
        <div className='relative min-h-screen min-w-screen'>
            {children}
            <nav className="absolute p-1 top-0 bottom-0 flex flex-col justify-between items-center z-10">
                <div>
                    <Image src={"/login.png"} alt="Homepage" width={30} height={30}></Image>
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <Link href="/home/metrics">
                        <button className="p-2 border-2 hover:border-black rounded border-transparent transition duration-300">
                            <TbActivityHeartbeat />
                        </button>
                    </Link>
                    <Link href="/home/metric_types">
                        <button className="p-2 border-2 hover:border-black rounded border-transparent transition duration-300">
                            <GoInfo />
                        </button>
                    </Link>
                    <Link href="/home/devices">
                        <button className="p-2 border-2 hover:border-black rounded border-transparent transition duration-300">
                            <MdSensors />
                        </button>
                    </Link>
                    <Link href="/home/locations">
                        <button className="p-2 border-2 hover:border-black rounded border-transparent transition duration-300">
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

