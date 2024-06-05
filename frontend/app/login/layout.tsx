export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='relative bg-gradient-to-b from-[#41D271] to-[#BD95EB] min-h-screen min-w-screen'>
      {children}
    </div>
  )
}

