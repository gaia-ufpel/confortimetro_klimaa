import React from 'react'
import { MdLock } from 'react-icons/md'
const REGISTRAR = () => {
    return (
        <div>
            <form action="" className='w-min-screen h-min-screen justify-center items-center flex font-montserrat'>
                <div className='grid space-y-4'>

                    <div className='space-y-1'>
                        <label className='block text-neutral-700 font-2xl font-normal pl-3'>Nome completo</label>
                        <input className="w-[710px] h-16 bg-zinc-300 rounded-3xl shadow" type='text'></input>
                    </div>
                    <div className='space-y-1'>
                        <label className='block text-neutral-700 font-2xl font-normal pl-3'>E-mail</label>
                        <input className="w-[710px] h-16 bg-zinc-300 rounded-3xl shadow" type='email'></input>
                    </div>
                    <div className='space-y-1'>
                        <label className='block text-neutral-700 font-2xl font-normal pl-3'>Senha</label>
                        <div className='relative flex items-center'>
                            <input className=" pl-3 w-[710px] h-16 bg-zinc-300 rounded-3xl shadow" type='password'></input>
                            <MdLock className='absolute text-stone-500 right-6 pointer-events-none h-7 w-7' />
                        </div>

                    </div>
                    <div className='space-y-1'>
                        <label className='block text-neutral-700 font-2xl font-normal pl-3'>Confirme sua senha</label>
                        <div className='relative flex items-center'>
                            <input className="pl-3 w-[710px] h-16 bg-zinc-300 rounded-3xl shadow" type='password'></input>
                            <MdLock className='absolute text-stone-500 right-6 pointer-events-none h-7 w-7' />
                        </div>

                    </div>
                </div>
            </form>
        </div>
    )
}

export default REGISTRAR