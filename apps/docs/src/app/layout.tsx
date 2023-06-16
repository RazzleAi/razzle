import logo from '../assets/images/razzle_logo_black.svg'
import Navigation from './navigation'

export default function Layout({ children }: any) {
  return (
    <div className="w-100 flex justify-center py-5 h-screen">
      <div className="w-5/6">
        <div className="flex pb-12">
          <div className="w-1/12">
            <img src={logo} alt="logo" />
          </div>
          <div className="w-11/12 flex items-end justify-end">light</div>
        </div>
        <div className="w-100 flex">
          <Navigation />
          <div className="w-4/6 flex items-center flex-col">
            <div className="w-80 flex items-start flex-col">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
