interface Props {
  children?: React.ReactNode;
}

export default function FormWrapper({ children }: Props) {
  return (
    <div className="max-w-(--breakpoint-xl) w-full mx-auto md:p-4 space-y-6">
      {children}
    </div>
  );
}
