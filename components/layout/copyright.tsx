/** Footer copyright line — year computed at render */
export function Copyright() {
  return (
    <p className="text-sm text-foreground/75">
      &copy; {new Date().getFullYear()}. All rights reserved.
    </p>
  );
}
