export default function DashboardLayout(
  {
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {

  return <div><h1 className="text-5xl" >Layout</h1>{children}</div>
}
