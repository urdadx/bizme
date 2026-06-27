import { Link } from "@tanstack/react-router";
import BizmeLogo from "@/assets/bizme-real-logo.png";
import { GithubSVG } from "@/assets/icons/github-svg";

const links = [
  {
    title: "Features",
    href: "#features",
  },

  {
    title: "FAQs",
    href: "#faqs",
  },
  {
    title: "Setup",
    href: "#setup",
  },
  // {
  //   title: "Terms of Service",
  //   href: "/legal/terms",
  // },
  // {
  //   title: "Privacy Policy",
  //   href: "/legal/privacy",
  // },
];

export function FooterSection() {
  return (
    <footer className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Link to="/" aria-label="go home" className="mx-auto block size-fit">
          <img src={BizmeLogo} alt="Bizme Logo" className="h-14 w-14" />{" "}
        </Link>

        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          {links.map((link, index) => (
            <Link
              key={index}
              to={link.href}
              className="text-muted-foreground hover:text-primary block duration-150"
            >
              <span>{link.title}</span>
            </Link>
          ))}
        </div>
        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          <a
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X/Twitter"
            href="https://x.com/NerdyProgramme2"
            className="text-muted-foreground hover:text-primary block"
          >
            <svg
              className="size-6"
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"
              ></path>
            </svg>
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            href="https://github.com/urdadx/bizme"
            className="text-muted-foreground hover:text-primary block"
          >
            <GithubSVG className="size-6" />
          </a>
        </div>
        <span className="text-muted-foreground block text-center text-sm">
          {" "}
          © {new Date().getFullYear()} Bizme, All rights reserved
        </span>
      </div>
    </footer>
  );
}
