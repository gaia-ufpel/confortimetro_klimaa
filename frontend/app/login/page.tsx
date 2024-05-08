'use client';
import React, { useState } from 'react'
import Image from 'next/image'
import { Montserrat } from 'next/font/google'
import { MdLock } from "react-icons/md";
import { FiAtSign } from "react-icons/fi";

const color1 = 'BD95EB'
const color2 = '41D271'

const LOGIN = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  return (
    <div className='flex flex-col justify-center items-center bg-gradient-to-b from-[#41D271] to-[#BD95EB] min-h-screen min-w-screen font-montserrat'>

      <form className='flex flex-col space-y-4 justify-center items-center p-10'>
        <Image src="/login.png" width={180} height={180} alt='login image' />
        <div className='relative space-y-8 py-10'>
          <div className='relative flex items-center'>
            <input type='email' className='block text-2xl text-stone-500 w-96 h-16 pr-10 pl-3 appearance-none bg-zinc-300 rounded-2xl shadow-md focus:outline-none peer' placeholder="Insira seu email" required />
            <label htmlFor="" className='absolute invisible left-3 select-none pointer-none bg-transparent text-stone-500 text-2xl font-normal '>Insira seu email</label>
            <FiAtSign className='absolute text-stone-500 right-3 pointer-events-none h-6 w-6' />
          </div>
          <div className='relative flex items-center'>
            <input type='password' className='block text-2xl text-stone-500 w-96 h-16 pr-10 pl-3 appearance-none bg-zinc-300 rounded-2xl shadow-md focus:outline-none peer' placeholder="Insira seu email" required />
            <label htmlFor="" className='absolute invisible left-3 select-none pointer-none bg-transparent text-stone-500 text-2xl font-normal '>Insira seu email</label>
            <MdLock className='absolute text-stone-500 right-3 pointer-events-none h-6 w-6' />
          </div>
          <button className='absolute right-0 bottom-0 text-zinc-100 text-base font-semibold'> Esqueci minha senha</button>

        </div>
          <button className='px-10 py-2 rounded-xl text-neutral-50 bg-[#885AC6] shadow-md border-2 border-green-300 font-extrabold text-2xl'> Entrar </button>
      </form>
      <div className='flex flex-col space-y-10'>
      <button className='text-zinc-100 text-base font-semibold'>Ainda não possui uma conta?</button>
      <button className='px-10 py-2 bg-[#78DF8C] opacity-75 text-neutral-50 text-xl font-semibold rounded-3xl border-2 border-violet-500 shadow-lg hover:opacity-100 duration-200'>Crie uma conta</button>
      </div>

    </div>
  )
}

export default LOGIN