import { Link } from "@nextui-org/link";
import { FaGithub, FaTwitter, FaDiscord } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="w-full py-8 px-4 bg-gray-900">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            CS2 Matchmaking
          </h2>
          <p className="text-gray-400 mt-2">
            Elevate your Counter-Strike 2 experience
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div>
            <h3 className="text-cyan-400 font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-cyan-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-300 hover:text-cyan-400 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-cyan-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-cyan-400 font-semibold mb-2">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-gray-300 hover:text-cyan-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-300 hover:text-cyan-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-cyan-400 font-semibold mb-2">Connect</h3>
            <div className="flex space-x-4">
              <Link href="https://github.com" isExternal>
                <FaGithub
                  className="text-gray-300 hover:text-cyan-400 transition-colors"
                  size={24}
                />
              </Link>
              <Link href="https://twitter.com" isExternal>
                <FaTwitter
                  className="text-gray-300 hover:text-cyan-400 transition-colors"
                  size={24}
                />
              </Link>
              <Link href="https://discord.com" isExternal>
                <FaDiscord
                  className="text-gray-300 hover:text-cyan-400 transition-colors"
                  size={24}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} CS2 Matchmaking. All rights reserved.
      </div>
    </footer>
  );
}
