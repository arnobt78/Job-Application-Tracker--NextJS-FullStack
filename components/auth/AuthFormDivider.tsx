/** OR divider between credential form and OAuth — matches sign-in card */
export function AuthFormDivider() {
  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-white/10" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-transparent px-2 text-muted-foreground">or</span>
      </div>
    </div>
  );
}
