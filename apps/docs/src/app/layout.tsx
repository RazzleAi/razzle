export default function Layout({ children }: any) {
  return (
    <div className="w-100 flex items-center justify-center py-5">
      <div className="w-5/6">
        <div className="flex pb-12">Logo</div>
        <div className="w-100 flex">
          <div className="w-2/6">Nav</div>
          <div className="w-4/6">{children}</div>
        </div>
      </div>
    </div>
  )
}
