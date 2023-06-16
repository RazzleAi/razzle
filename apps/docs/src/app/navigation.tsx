import { useLocation, useNavigate } from 'react-router-dom'

export default function Navigation() {
  // Get the current url using react touter

  const location = useLocation()
  console.log(location.pathname)

  const links = [
    {
      name: 'Intro',
      url: '/',
    },
    {
      name: 'Quick Start',
      url: '/quick-start',
    },
    {
      name: 'Actions',
      url: '/actions',
    },
    {
      name: 'Accepting input',
      url: '/accepting-input',
    },
    {
      name: 'Returning UI',
      url: '/returning-ui',
    },
  ]

  return (
    <div className="w-2/12 text-xl space-y-4 ">
      {links.map((link) => (
        <NavLink
          key={link.name}
          active={location.pathname === link.url}
          url={link.url}
        >
          {link.name}
        </NavLink>
      ))}
    </div>
  )
}

function NavLink({ children, active, url }: any) {
  const classes = active ? 'bg-electricIndigo-500 text-white' : ''
  const navigator = useNavigate()

  return (
    <div
      className={`p-3 rounded-md cursor-pointer ${classes}`}
      onClick={() => navigator(url)}
    >
      {children}
    </div>
  )
}
