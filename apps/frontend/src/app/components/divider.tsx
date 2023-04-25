export function Divider(props?: {hideBottomMargin?: boolean}) {
  const { hideBottomMargin } = props
  return (
    <div className={`flex h-[1px] bg-transparent w-full ${hideBottomMargin === true ? '' : 'mb-4'}`}>
      <div className="flex h-full w-full bg-[#E8EBED]"></div>
    </div>
  )
}
