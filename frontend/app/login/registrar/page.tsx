"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { MdLock } from 'react-icons/md';
const REGISTRAR = () => {

    const [credentials, setCredentials] = useState({
        name: '',
        email: '',
        password: '',
        newpassword: '',
    })

    return (
        <div className='flex flex-col min-h-screen min-w-screen items-center justify-center space-y-20'>
            <form action="" className='font-montserrat'>
                <div className='grid space-y-4'>
                    <div className='space-y-1'>
                        <label className='block text-neutral-700 text-[24px] font-normal pl-3'>Nome completo</label>
                        <input className=" pl-8 md:pr-10 w-80 md:w-[710px] h-10 md:h-16 bg-zinc-300 rounded-3xl shadow-[0px_4px_4px_#00000040] outline-none" type='text' required onChange={(ev) => { setCredentials({ ...credentials, name: ev?.target.value }) }}></input>
                    </div>
                    <div className='space-y-1'>
                        <label className='block text-neutral-700 text-[24px] font-normal pl-3'>E-mail</label>
                        <input className=" pl-8 md:pr-10 w-80 md:w-[710px] h-10 md:h-16 bg-zinc-300 rounded-3xl shadow-[0px_4px_4px_#00000040] outline-none" type='email' required onChange={(ev) => { setCredentials({ ...credentials, email: ev?.target.value }) }}></input>
                    </div>
                    <div className='space-y-1'>
                        <label className='block text-neutral-700 text-[24px] font-normal pl-3'>Senha</label>
                        <div className='relative flex items-center'>
                            <input className=" pl-8 md:pr-16 w-80 md:w-[710px] h-10 md:h-16 bg-zinc-300 rounded-3xl shadow-[0px_4px_4px_#00000040] outline-none" type='password' required onChange={(ev) => { setCredentials({ ...credentials, password: ev?.target.value }) }}></input>
                            <MdLock className='absolute text-stone-500 right-6 pointer-events-none h-7 w-7' />
                        </div>
                    </div>
                    <div className='space-y-1'>
                        <label className='block text-neutral-700 text-[24px] font-normal pl-3'>Confirme sua senha</label>
                        <div className='relative flex items-center'>
                            <input className="pl-8 md:pr-16 w-80 md:w-[710px] h-10 md:h-16 bg-zinc-300 rounded-3xl shadow-[0px_4px_4px_#00000040] outline-none" type='password' required onChange={(ev) => { setCredentials({ ...credentials, newpassword: ev?.target.value }) }}></input>
                            <MdLock className='absolute text-stone-500 right-6 pointer-events-none h-7 w-7' />
                        </div>
                    </div>
                </div>
            </form>
            <button className=' block text-center font-montserrat h-12 px-10 py-2 bg-[#78DF8C] opacity-75 text-neutral-50 text-xl font-semibold rounded-3xl border-2 border-violet-500 shadow-lg hover:opacity-100 duration-200'>Crie uma conta</button>
            <Image src="/register.png" width={250} height={250} alt='register image' className='md:absolute md:left-10 md:bottom-10' />
        </div>
    )
}

export default REGISTRAR