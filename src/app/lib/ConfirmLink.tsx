import Link from "next/link";
import { useRouter } from "next/router";

const ConfirmLink = ({
  href,
  children,
  hasUnsavedChanges,
  className,
}: {
  href: string;
  children: React.ReactNode;
  hasUnsavedChanges: boolean;
  className?: string;
}) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (
      hasUnsavedChanges &&
      !window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      )
    ) {
      e.preventDefault();
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
};

export default ConfirmLink;
