import LogoSquare from "@components/LogoSquare";
import Link from "next/link";
import HamburgerMenu from "./HamburgerMenu";
import { whyte } from "@fonts";

export default function Navbar() {
  const menu = [
    {
      title: "Home",
      path: "/",
    },
    {
      title: "About",
      path: "/about",
    },
    {
      title: "Room",
      path: "/room",
    },
    {
      title: "Lobby",
      path: "/lobby",
    },
    {
      title: "ItsAMatch",
      path: "/itsamatch",
    },
  ];

  return (
    <>
      <nav className="flex w-full items-center justify-between p-4 lg:px-6 fixed top-0 z-50 bg-black/10 backdrop-blur-lg">
        <div className="block flex-none md:hidden">
          <HamburgerMenu menu={menu} />
        </div>
        <div className="flex w-full justify-between items-center text-gray-200 text-xl">
          <div className="flex w-full md:w-1/3">
            <Link href="/" className="md:flex items-center gap-2 hidden">
              <LogoSquare />
              <div className={`font-semibold ${whyte.className}`}>Blinkr</div>
            </Link>
          </div>
          <div className="flex justify-end md:w-1/3">
            <w3m-button />
          </div>
        </div>
      </nav>
    </>
  );
}
