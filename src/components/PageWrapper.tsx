interface Props {
  children?: React.ReactNode;
}

export default function PageWrapper({ children }: Props) {
  return (
    <div className="max-w-(--breakpoint-2xl) w-full mx-auto md:px-4 space-y-6">
      {children}
    </div>
  );
}
